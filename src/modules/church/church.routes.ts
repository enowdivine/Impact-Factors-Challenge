import express from "express";
import ChurchController from "./church.controller";

const router = express.Router();
const churchController = new ChurchController();

router.post("/create", churchController.createChurch);
router.put("/update/:id", churchController.updateChurch);
router.get("/", churchController.getAllChurches);
router.get("/:id", churchController.getChurchById);
router.delete("/delete/:id", churchController.deleteChurch);

export default router;
