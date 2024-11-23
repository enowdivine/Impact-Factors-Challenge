import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../user/user.model";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

class StripeController {
  async fetchSubscriptionPlans(req: Request, res: Response) {
    try {
      const prices = await stripe.prices.list({
        expand: ["data.product"],
      });

      res.status(200).json({ plans: prices.data });
    } catch (error: any) {
      res.status(500).send({ error: error.message });
    }
  }

  async createCustomer(req: Request, res: Response) {
    const { userId, name, email } = req.body;
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: { userId: userId.toString() },
      });

      // Save the Stripe customer ID to the user's premium field
      await User.findByIdAndUpdate(userId, {
        "premium.stripeCustomerId": customer.id,
      });

      res.status(200).json({
        customer: customer,
      });
    } catch (error: any) {
      console.error("Error creating customer:", error.message);
      res.status(500).send({ error: error.message });
    }
  }

  async createSubscription(req: Request, res: Response) {
    const { customerId, priceId } = req.body;
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent"],
      });

      if (subscription.latest_invoice) {
        const latest_invoice = subscription.latest_invoice as Stripe.Invoice;
        if (latest_invoice.payment_intent) {
          const payment_intent =
            latest_invoice.payment_intent as Stripe.PaymentIntent;
          res.status(200).json({
            subscription,
            clientSecret: payment_intent.client_secret,
          });
        }
      }
    } catch (error: any) {
      console.error("Error creating subscription:", error.message);
      res.status(500).send({ error: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      const rawBody = JSON.stringify(req.body);
      console.log(req.body);
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const stripeCustomerId = subscription.customer as string;

          const user = await User.findOne({
            "premium.stripeCustomerId": stripeCustomerId,
          });

          if (user) {
            const isActive = subscription.status === "active";
            await User.findByIdAndUpdate(user._id, {
              "premium.isPremium": isActive,
              "premium.plan": isActive
                ? subscription.items.data[0].price.id
                : "FREE",
              "premium.expiresIn": isActive
                ? new Date(subscription.current_period_end * 1000)
                : null,
            });
          }

          console.log(
            `Subscription status for customer ${stripeCustomerId} updated to ${subscription.status}`
          );
          break;
        }

        case "invoice.payment_succeeded": {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Payment succeeded for invoice ${invoice.id}`);
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const stripeCustomerId = invoice.customer as string;

          console.error(`Payment failed for invoice ${invoice.id}`);

          const user = await User.findOne({
            "premium.stripeCustomerId": stripeCustomerId,
          });

          if (user) {
            // Deactivate the user's premium features if payment fails
            await User.findByIdAndUpdate(user._id, {
              "premium.isPremium": false,
              "premium.plan": "FREE",
              "premium.expiresIn": null,
            });

            console.log(
              `Deactivated premium features for user ${user._id} due to payment failure.`
            );
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error(`Error processing webhook event: ${error.message}`);
      res.status(500).send(`Webhook handler error: ${error.message}`);
    }
  }
}

export default StripeController;
