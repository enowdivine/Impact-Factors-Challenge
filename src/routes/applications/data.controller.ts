import { Request, Response } from "express";
import Application from "./data.model";
import sendEmail from "../../services/email/email";
import userModel from "../user/user.model";
import Counter from "./appID.model";

import {
  newApplication,
  processingApplication,
  rejectedApplication,
  acceptedApplication,
} from "./templates/email";

class ApplicationController {
  async create(req: Request, res: Response) {
    try {
      const abbreviation = "CCM" + req.body.abbreviation;
      const currentYear = new Date().getFullYear().toString().slice(-2);

      // Find and update the counter
      const result = await Counter.findOneAndUpdate(
        { abbreviation: abbreviation, year: currentYear },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );

      // Generate the application ID
      const number = String(result.count).padStart(3, "0");
      const applicationID = `${abbreviation}${currentYear}${number}`;

      const data = new Application({
        uniqueAppID: applicationID,
        studentId: req.body.studentId,
        programId: req.body.programId,
        universityId: req.body.universityId,
        studentName: req.body.studentName,
        programName: req.body.programName,
        universityName: req.body.universityName,
        isPaid: req.body.isPaid,
        status: req.body.status,
      });
      await data
        .save()
        .then(async () => {
          const student = await userModel.findOne({ _id: req.body.studentId });
          sendEmail({
            to: student!.emailAddress,
            subject: `Application Recieved <Campus Camer Inc> - ${req.body.programName}`,
            message: newApplication(
              req.body.studentName,
              req.body.programName,
              req.body.universityName
            ),
            title: "",
          });

          res.status(201).json({
            message: "success",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "an error occured",
            error: err,
          });
        });
    } catch (error) {
      console.error("an error occured", error);
      return res.status(500).json({
        message: "an error occured",
      });
    }
  }

  async readOne(req: Request, res: Response) {
    try {
      const data = await Application.findOne({ _id: req.params.id });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async readByUniversityId(req: Request, res: Response) {
    try {
      const data = await Application.find({ universityId: req.params.id }).sort(
        {
          createdAt: -1,
        }
      );
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async readByAssignedUniversities(req: Request, res: Response) {
    try {
      const data = await Application.find({
        universityId: { $in: req.query.universityIds },
      }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async readByStudentId(req: Request, res: Response) {
    try {
      const data = await Application.find({ studentId: req.params.id }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async readByProgramId(req: Request, res: Response) {
    try {
      const data = await Application.find({ programId: req.params.id }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async read(req: Request, res: Response) {
    try {
      const data = await Application.find().sort({ createdAt: -1 });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await Application.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            studentName: req.body.studentName,
            programName: req.body.programName,
            universityName: req.body.universityName,
            isPaid: req.body.isPaid,
            status: req.body.status,
            documents: req.body.documents,
          },
        }
      );
      if (updated.acknowledged) {
        // Send Email
        if (req.body.status) {
          const application = await Application.findOne({ _id: req.params.id });
          sendEmail({
            to: req.body.studentEmail,
            subject: `Application Status<Campus Camer Inc> - ${req.body.status}`,
            message:
              req.body.status === "PROCESSING"
                ? processingApplication(
                    application!.studentName,
                    application!.programName,
                    application!.universityName
                  )
                : req.body.status === "ACCEPTED"
                ? acceptedApplication(
                    application!.studentName,
                    application!.programName,
                    application!.universityName
                  )
                : req.body.status === "REJECTED"
                ? rejectedApplication(
                    application!.studentName,
                    application!.programName,
                    application!.universityName
                  )
                : "",
            title: `Application Status | ${req.body.status}`,
          });
        }

        // Send response
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(404).json({
          message: "an error occured",
        });
      }
    } catch (error) {
      console.error("error updating data", error);
      return res.status(500).json({
        message: "error updating data",
      });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const response = await Application.deleteOne({ _id: req.params.id });
      if (response.deletedCount > 0) {
        res.status(200).json({
          message: "data deleted",
        });
      } else {
        res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error) {
      console.error("error deleting data", error);
      return res.status(500).json({
        message: "error deleting data",
      });
    }
  }
}

export default ApplicationController;
