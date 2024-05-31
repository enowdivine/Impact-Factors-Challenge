import { Request, Response } from "express";
import Application from "./data.model";

class ApplicationController {
  async create(req: Request, res: Response) {
    try {
      const data = new Application({
        studentId: req.body.studentId,
        programId: req.body.programId,
        universityId: req.body.universityId,
        programName: req.body.programName,
        isPaid: req.body.isPaid,
        status: req.body.status,
      });
      await data
        .save()
        .then(() => {
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
      console.error("error uploading resource", error);
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
            studentId: req.body.studentId,
            programId: req.body.programId,
            universityId: req.body.universityId,
            programName: req.body.programName,
            isPaid: req.body.isPaid,
            status: req.body.status,
            documents: req.body.documents,
          },
        }
      );
      if (updated.acknowledged) {
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
