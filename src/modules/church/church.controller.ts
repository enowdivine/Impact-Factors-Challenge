import { Request, Response } from "express";
import Church from "./church.model";
import Admin from "../admin/admin.model";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

class ChurchController {
  async createChurch(req: Request, res: Response) {
    try {
      const { churchName, adminName, adminEmail, adminPassword } = req.body;

      // Check if church already exists
      const existingChurch = await Church.findOne({ name: churchName });
      if (existingChurch) {
        return res
          .status(409)
          .json({ message: "Church with that name already exists" });
      }

      // Create a new church
      const newChurch = new Church({
        name: churchName,
        subdomain: `${churchName.toLowerCase().replace(/\s+/g, "-")}.localhost`,
      });

      await newChurch.save();

      // Assign a Church Admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const newAdmin = new Admin({
        username: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        churchId: newChurch._id,
      });

      await newAdmin.save();

      return res.status(201).json({
        message: "Church created successfully",
        church: newChurch,
        admin: newAdmin,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while creating the church",
        error: error.message,
      });
    }
  }

  async getChurchById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid church ID" });
      }

      // Find the church (without trying to populate `admin`)
      const church = await Church.findById(id)
        .populate("templateId", "name")
        .lean();

      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Fetch the admin separately using the church's ID
      const admin = await Admin.findOne({ churchId: id }).select(
        "username email"
      );

      // Attach admin details manually
      return res.status(200).json({ ...church, admin });
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while fetching church details",
        error: error.message,
      });
    }
  }

  async getAllChurches(req: Request, res: Response) {
    try {
      const churches = await Church.find().populate("templateId", "name"); // Include template name if assigned
      return res.status(200).json(churches);
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while fetching churches",
        error: error.message,
      });
    }
  }

  async updateChurch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedChurch = await Church.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!updatedChurch)
        return res.status(404).json({ message: "Church not found" });

      return res.json(updatedChurch);
    } catch (error) {
      return res.status(500).json({ message: "Error updating church" });
    }
  }

  async deleteChurch(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid church ID" });
      }

      const church = await Church.findById(id);
      if (!church) {
        return res.status(404).json({ message: "Church not found" });
      }

      // Delete all admins associated with this church
      await Admin.deleteMany({ churchId: id });

      // Delete the church itself
      await Church.findByIdAndDelete(id);

      return res.status(200).json({ message: "Church deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while deleting the church",
        error: error.message,
      });
    }
  }
}

export default ChurchController;
