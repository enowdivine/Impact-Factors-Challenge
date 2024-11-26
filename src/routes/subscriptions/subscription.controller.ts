import { Request, Response } from "express";
import Subscription from "./subscription.model";

class SubscriptionController {
  async listCurrentSubscription(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      // Find the active subscription for the given user ID
      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ["active", "trialing"] }, // Only return active or trialing subscriptions
      });

      if (!subscription) {
        return res
          .status(200)
          .json({
            message: "No active subscription found.",
            subscription: null,
            isPremum: false,
          });
      }

      res.status(200).json({ subscription, isPremum: true });
    } catch (error: any) {
      console.error("Error fetching subscription:", error.message);
      res.status(500).send({ error: error.message });
    }
  }
}

export default SubscriptionController;
