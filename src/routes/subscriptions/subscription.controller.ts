import { Request, Response } from "express";
import Subscription from "./subscription.model";
import User from "../user/user.model";

class SubscriptionController {
  async listCurrentSubscription(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Find the active subscription for the given user ID
      const subscription = await Subscription.findOne({
        userId: id,
        status: { $in: ["active", "trialing"] }, // Only return active or trialing subscriptions
      });

      const isPremium = !!subscription; // True if a valid subscription exists
      await User.findByIdAndUpdate(id, { "premium.isPremium": isPremium });

      if (!subscription) {
        return res.status(200).json({
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
