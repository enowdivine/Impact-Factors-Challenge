import express from "express";
import ChurchController from "./church.controller";

const router = express.Router();
const churchController = new ChurchController();

router.post("/create", churchController.createChurch);
router.post("/:churchId/assign-form", churchController.assignForm);

router.put("/update/:id", churchController.updateChurch);

router.get("/", churchController.getAllChurches);
router.get("/:id", churchController.getChurchById);
router.get("/subdomain/:subdomain", churchController.getChurchBySubdomain);
router.get("/:churchId/assigned-forms", churchController.getAssignedForms);

router.delete("/delete/:id", churchController.deleteChurch);

export default router;
