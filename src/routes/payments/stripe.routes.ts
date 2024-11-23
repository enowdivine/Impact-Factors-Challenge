import express from "express";
import Stripe from "./stripe.controller";

const router = express.Router();
const stripe = new Stripe();

router.get("/subscription-plans", stripe.fetchSubscriptionPlans);
router.post("/create-customer", stripe.createCustomer);
router.post("/create-subscription", stripe.createSubscription);

export default router;
