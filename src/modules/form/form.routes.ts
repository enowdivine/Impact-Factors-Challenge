import express from "express";
import FormController from "./form.controller";

const router = express.Router();
const formController = new FormController();

router.post("/create", formController.createForm);
router.post("/submit", formController.submitForm);

router.get("/church/:churchId", formController.getFormsByChurch);
router.get(
  "/churches/:churchId/submissions",
  formController.getFormSubmissions
);

router.put("/update/:formId", formController.updateForm);

router.delete("/delete/:id", formController.deleteForm);

export default router;
