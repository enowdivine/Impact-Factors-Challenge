import { Request, Response } from "express";
import Form from "./form.model";

class FormController {
  async createForm(req: Request, res: Response) {
    try {
      const { churchId, name, fields } = req.body;

      const newForm = new Form({ church: churchId, name, fields });
      await newForm.save();

      return res
        .status(201)
        .json({ message: "Form created successfully", form: newForm });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Form creation failed", error: error.message });
    }
  }

  async getFormsByChurch(req: Request, res: Response) {
    try {
      const { churchId } = req.params;
      const forms = await Form.find({ church: churchId });

      return res.status(200).json(forms);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error fetching forms", error: error.message });
    }
  }

  async updateForm(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      const { name, fields } = req.body;

      const updatedForm = await Form.findByIdAndUpdate(
        formId,
        { name, fields },
        { new: true, runValidators: true }
      );

      if (!updatedForm) {
        return res.status(404).json({ message: "Form not found" });
      }

      return res
        .status(200)
        .json({ message: "Form updated successfully", form: updatedForm });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error updating form", error: error.message });
    }
  }

  async submitForm(req: Request, res: Response) {
    try {
      const { formId, data } = req.body;
      console.log(`Form Submission for ${formId}:`, data);

      return res.status(200).json({ message: "Form submitted successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Form submission failed", error: error.message });
    }
  }
}

export default FormController;
