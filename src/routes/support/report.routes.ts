import express from "express";
import Support from "./support.controller";

const router = express.Router();
const support = new Support();

router.post("/new-support-message", support.newMessage);

router.get("/", support.supportMessages);
router.get("/:id", support.supportMessage);

router.put("/update-status/:id", support.updateStatus);

router.delete("/delete-support-message/:id", support.deleteSupportMessage);

export default router;
