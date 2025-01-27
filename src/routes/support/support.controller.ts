import mongoose from "mongoose";
import { Request, Response } from "express";
import Support from "./support.model";

class SupportController {
  async newMessage(req: Request, res: Response) {
    try {
      const { userId, reasons } = req.body;

      // Validate request body
      if (!userId || !reasons) {
        return res.status(400).json({
          message: "Missing required fields: userId, or reasons",
        });
      }

      const newSupportMessage = new Support({ userId, reasons });

      const savedSupport = await newSupportMessage.save();

      return res.status(201).json({
        message: "Sucess saved successfully",
        supportId: savedSupport._id,
      });
    } catch (error: any) {
      console.error("Error creating support message:", error);
      return res.status(500).json({
        message: error.message || "Error creating support",
      });
    }
  }

  async supportMessages(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const data = await Support.find()
        .populate("userId")
        .skip((page - 1) * limit)
        .limit(limit);

      if (!data || data.length === 0) {
        return res.status(404).json({
          message: "No message found",
        });
      }

      return res.status(200).json({
        message: "Messages fetched successfully",
        data,
        pagination: {
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({
        message: error.message || "Error fetching message data",
      });
    }
  }

  async supportMessage(req: Request, res: Response) {
    try {
      const supportId = req.params.id;

      // Validate support ID
      if (!mongoose.Types.ObjectId.isValid(supportId)) {
        return res.status(400).json({
          message: "Invalid support ID",
        });
      }

      // Fetch the message
      const data = await Support.findById(supportId).populate("userId");

      // Handle case where message is not found
      if (!data) {
        return res.status(404).json({
          message: "No message found",
        });
      }

      // Return success response
      return res.status(200).json({
        message: "Message fetched successfully",
        support: data,
      });
    } catch (error: any) {
      console.error("Error fetching support:", error);
      return res.status(500).json({
        message: error.message || "Error fetching support data",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const supportId = req.params.id;
      const { status } = req.body;

      // Validate support ID
      if (!mongoose.Types.ObjectId.isValid(supportId)) {
        return res.status(400).json({
          message: "Invalid support ID",
        });
      }

      // Validate status
      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      // Update the status
      const updatedSupportMessage = await Support.findByIdAndUpdate(
        supportId,
        { status },
        { new: true } // Return the updated document
      ).populate("userId");

      if (!updatedSupportMessage) {
        return res.status(404).json({
          message: "No support found",
        });
      }

      return res.status(200).json({
        message: "Support status updated successfully",
        support: updatedSupportMessage,
      });
    } catch (error: any) {
      console.error("Error updating support status:", error);
      return res.status(500).json({
        message: error.message || "Error updating support status",
      });
    }
  }

  async deleteSupportMessage(req: Request, res: Response) {
    try {
      const supportId = req.params.id;

      // Validate support ID
      if (!mongoose.Types.ObjectId.isValid(supportId)) {
        return res.status(400).json({
          message: "Invalid support ID",
        });
      }

      // Delete the support
      const deletedSupportMessage = await Support.findByIdAndDelete(supportId);

      if (!deletedSupportMessage) {
        return res.status(404).json({
          message: "No support found to delete",
        });
      }

      return res.status(200).json({
        message: "Support deleted successfully",
        support: deletedSupportMessage,
      });
    } catch (error: any) {
      console.error("Error deleting support:", error);
      return res.status(500).json({
        message: error.message || "Error deleting support",
      });
    }
  }
}

export default SupportController;
