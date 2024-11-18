import express from "express";
import Notification from "./notification.controller";

const router = express.Router();
const notification = new Notification();

router.post("/generate-notifications", notification.generateNotifications);
router.post("/send-notifications", notification.sendTestNotification);
router.get("/:id/list", notification.getUserNotifications);

export default router;
