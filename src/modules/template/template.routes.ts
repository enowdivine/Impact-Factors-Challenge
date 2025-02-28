import express from "express";
import TemplateController from "./template.controller";

const router = express.Router();
const templateController = new TemplateController();

router.get("/", templateController.getAllTemplates);
router.get("/:id", templateController.getTemplate);
router.post("/create", templateController.createTemplate);
router.put("/update/:id", templateController.updateTemplate);
router.delete("/delete/:id", templateController.deleteTemplate);

router.post("/assign", templateController.assignTemplateToChurch);

export default router;
