import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../user/user.model";
import Subscription from "../subscriptions/subscription.model";

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
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      // Check if the user already has a Stripe customer ID
      if (user.premium?.stripeCustomerId) {
        console.log("Returning existing Stripe customer ID.");
        const existingCustomer = await stripe.customers.retrieve(
          user.premium.stripeCustomerId
        );
        return res.status(200).json({ customer: existingCustomer });
      }

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
      const existingSubscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active", // Filter by active subscriptions
      });

      if (existingSubscriptions.data.length > 0) {
        return res.status(400).json({
          message: "You already have an active subscription.",
          subscriptions: existingSubscriptions.data,
        });
      }

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

  async cancelSubscription(req: Request, res: Response) {
    try {
      const { userId } = req.body;

      // Fetch the user from the database
      const user = await User.findById(userId);

      if (!user || !user.premium?.stripeCustomerId) {
        return res
          .status(404)
          .json({ error: "User or Stripe customer not found." });
      }

      const customerId = user.premium.stripeCustomerId;

      // Retrieve active subscriptions for the customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
      });

      if (subscriptions.data.length === 0) {
        return res
          .status(400)
          .json({ message: "No active subscriptions found." });
      }

      const subscriptionId = subscriptions.data[0].id;

      // Cancel the subscription
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true, // Cancels at the end of the billing cycle
      });

      // Update the subscription status in the database
      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: subscriptionId },
        { status: "canceled" }
      );

      // Update the user's premium status
      await User.findByIdAndUpdate(userId, {
        "premium.isPremium": false,
      });

      return res.status(200).json({
        message:
          "Subscription cancellation scheduled. You will retain access until the end of the billing period.",
      });
    } catch (error: any) {
      console.error("Error canceling subscription:", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
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
          const stripeSubscriptionId = subscription.id;

          // Find subscription in the database
          const existingSubscription = await Subscription.findOne({
            stripeSubscriptionId,
          });

          const subscriptionData = {
            stripeCustomerId,
            stripeSubscriptionId,
            plan: subscription.items.data[0].price.id,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          };

          if (existingSubscription) {
            // Update the existing subscription
            await Subscription.findByIdAndUpdate(
              existingSubscription._id,
              subscriptionData
            );
            console.log(
              `Subscription ${stripeSubscriptionId} updated for customer ${stripeCustomerId}`
            );
          } else {
            // Find the associated user by Stripe customer ID
            const user = await User.findOne({
              "premium.stripeCustomerId": stripeCustomerId,
            });

            if (!user) {
              console.error(`User not found for customer ${stripeCustomerId}`);
              return res.status(404).send("User not found");
            }

            // Create a new subscription record
            await Subscription.create({
              userId: user._id,
              ...subscriptionData,
            });

            console.log(
              `Subscription ${stripeSubscriptionId} created for customer ${stripeCustomerId}`
            );
          }

          // Update the `isPremium` field in the User model
          const isActive = subscription.status === "active";
          const user = await User.findOne({
            "premium.stripeCustomerId": stripeCustomerId,
          });

          if (user) {
            await User.findByIdAndUpdate(user._id, {
              "premium.isPremium": isActive,
            });
            console.log(
              `User ${user._id} premium status updated to ${
                isActive ? "true" : "false"
              }`
            );
          }

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

          const subscription = await Subscription.findOne({
            stripeCustomerId,
          });

          if (subscription) {
            // Update the subscription status to canceled in case of payment failure
            await Subscription.findByIdAndUpdate(subscription._id, {
              status: "canceled",
            });

            console.log(
              `Subscription ${subscription.stripeSubscriptionId} canceled due to payment failure.`
            );

            // Also update the user's premium status
            const user = await User.findById(subscription.userId);
            if (user) {
              await User.findByIdAndUpdate(user._id, {
                "premium.isPremium": false,
              });
              console.log(
                `User ${user._id} premium status set to false due to payment failure.`
              );
            }
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
