import { Request, Response } from "express";
import Template from "./template.model";
import Church from "../church/church.model";

class TemplateController {
  async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = await Template.find();
      return res.status(200).json(templates);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error fetching templates", error: error.message });
    }
  }

  async createTemplate(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const newTemplate = new Template({ name, description });
      await newTemplate.save();
      return res.status(201).json(newTemplate);
    } catch (error) {
      return res.status(500).json({ message: "Error creating template" });
    }
  }

  async getTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedTemplate = await Template.findOne({ _id: id });
      if (!updatedTemplate)
        return res.status(404).json({ message: "Template not found" });

      return res.json(updatedTemplate);
    } catch (error) {
      return res.status(500).json({ message: "Error updating template" });
    }
  }

  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedTemplate = await Template.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedTemplate)
        return res.status(404).json({ message: "Template not found" });

      return res.json(updatedTemplate);
    } catch (error) {
      return res.status(500).json({ message: "Error updating template" });
    }
  }

  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedTemplate = await Template.findByIdAndDelete(id);
      if (!deletedTemplate)
        return res.status(404).json({ message: "Template not found" });

      return res.json({ message: "Template deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting template" });
    }
  }

  async assignTemplateToChurch(req: Request, res: Response) {
    try {
      const { churchId, templateId } = req.body;

      const church = await Church.findById(churchId);
      if (!church) return res.status(404).json({ message: "Church not found" });

      church.templateId = templateId;
      church.isPublished = true;
      await church.save();

      return res
        .status(200)
        .json({ message: "Template assigned successfully", church });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error assigning template", error: error.message });
    }
  }
}

export default TemplateController;
