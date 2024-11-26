import express from "express";
import Subscription from "./subscription.controller";

const router = express.Router();
const subscription = new Subscription();

router.get("/:id", subscription.listCurrentSubscription);

export default router;
