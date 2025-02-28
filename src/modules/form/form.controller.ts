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

  async deleteForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedForm = await Form.findByIdAndDelete(id);

      if (!deletedForm) {
        return res.status(404).json({ message: "Form not found" });
      }

      return res.status(200).json({ message: "Form deleted successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error deleting form", error: error.message });
    }
  }

  async submitForm(req: Request, res: Response) {
    try {
      const { formId, data } = req.body;

      // 1️⃣ Check if the form exists
      const form = await Form.findById(formId);
      if (!form) {
        return res.status(404).json({ message: "Form not found" });
      }

      // 2️⃣ Save the submitted data into the form's `submissions` array
      form.submissions.push({
        data,
        submittedAt: new Date(), // ✅ Add missing `submittedAt`
      });

      // 3️⃣ Save changes in the database
      await form.save();

      return res.status(200).json({ message: "Form submitted successfully" });
    } catch (error: any) {
      console.error("❌ Error Submitting Form:", error);
      return res.status(500).json({
        message: "Form submission failed",
        error: error.message,
      });
    }
  }

  async getFormSubmissions(req: Request, res: Response) {
    try {
      const { churchId } = req.params;

      // Find all forms for the church
      const forms = await Form.find({ church: churchId });

      if (!forms.length) {
        return res
          .status(404)
          .json({ message: "No forms found for this church" });
      }

      // Extract all submissions
      const allSubmissions = forms.flatMap((form) =>
        form.submissions.map((submission) => ({
          formId: form._id,
          formName: form.name,
          submittedAt: submission.submittedAt,
          data: submission.data,
        }))
      );

      return res.status(200).json({
        message: "Submissions retrieved successfully",
        submissions: allSubmissions,
      });
    } catch (error: any) {
      console.error("❌ Error Fetching Submissions:", error);
      return res.status(500).json({
        message: "Error fetching submissions",
        error: error.message,
      });
    }
  }
}

export default FormController;
