import mongoose from "mongoose";
import { Request, Response } from "express";
import Report from "./report.model";

class ReportController {
  async createReport(req: Request, res: Response) {
    try {
      const { currentUser, targetUser, reasons } = req.body;

      // Create a new report
      const newReport = new Report({
        currentUser,
        targetUser,
        reasons,
      });

      // Save the report
      const savedReport = await newReport.save();

      return res.status(201).json({
        message: "Report saved successfully",
        reportId: savedReport._id,
      });
    } catch (error: any) {
      console.error("Error creating report:", error);
      return res.status(500).json({
        message: error.message || "Error creating report",
      });
    }
  }

  async reports(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const data = await Report.find()
        .populate("currentUser")
        .populate("targetUser")
        .skip((page - 1) * limit)
        .limit(limit);

      if (!data || data.length === 0) {
        return res.status(404).json({
          message: "No reports found",
        });
      }

      return res.status(200).json({
        message: "Reports fetched successfully",
        data,
        pagination: {
          currentPage: page,
          pageSize: limit,
        },
      });
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      return res.status(500).json({
        message: error.message || "Error fetching report data",
      });
    }
  }

  async report(req: Request, res: Response) {
    try {
      const reportId = req.params.id;

      // Validate report ID
      if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
          message: "Invalid report ID",
        });
      }

      // Fetch the report
      const data = await Report.findById(reportId)
        .populate("currentUser")
        .populate("targetUser");

      // Handle case where report is not found
      if (!data) {
        return res.status(404).json({
          message: "No report found",
        });
      }

      // Return success response
      return res.status(200).json({
        message: "Report fetched successfully",
        report: data,
      });
    } catch (error: any) {
      console.error("Error fetching report:", error);
      return res.status(500).json({
        message: error.message || "Error fetching report data",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const reportId = req.params.id;
      const { status } = req.body;

      // Validate report ID
      if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
          message: "Invalid report ID",
        });
      }

      // Validate status
      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      // Update the status
      const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        { status },
        { new: true } // Return the updated document
      )
        .populate("currentUser")
        .populate("targetUser");

      if (!updatedReport) {
        return res.status(404).json({
          message: "No report found",
        });
      }

      return res.status(200).json({
        message: "Report status updated successfully",
        report: updatedReport,
      });
    } catch (error: any) {
      console.error("Error updating report status:", error);
      return res.status(500).json({
        message: error.message || "Error updating report status",
      });
    }
  }

  async deleteReport(req: Request, res: Response) {
    try {
      const reportId = req.params.id;

      // Validate report ID
      if (!mongoose.Types.ObjectId.isValid(reportId)) {
        return res.status(400).json({
          message: "Invalid report ID",
        });
      }

      // Delete the report
      const deletedReport = await Report.findByIdAndDelete(reportId);

      if (!deletedReport) {
        return res.status(404).json({
          message: "No report found to delete",
        });
      }

      return res.status(200).json({
        message: "Report deleted successfully",
        report: deletedReport,
      });
    } catch (error: any) {
      console.error("Error deleting report:", error);
      return res.status(500).json({
        message: error.message || "Error deleting report",
      });
    }
  }
}

export default ReportController;
