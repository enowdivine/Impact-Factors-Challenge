import express from "express";
import Notification from "./notification.controller";

const router = express.Router();
const notification = new Notification();

router.post("/generate-notifications", notification.generateNotifications);
router.get("/:id/list", notification.getUserNotifications);

export default router;
