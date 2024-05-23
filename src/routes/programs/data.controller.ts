import { Request, Response } from "express";
import Program from "./data.model";

class ProgramController {
  async create(req: Request, res: Response) {
    try {
      const program = new Program({
        universityId: req.body.universityId,
        name: req.body.name,
        levelOfStudy: req.body.levelOfStudy,
        description: req.body.description,
        duration: req.body.duration,
        applicationDeadline: req.body.applicationDeadline,
        location: req.body.location,
        admissionRequirements: req.body.admissionRequirements,
        conditionsForAcceptance: req.body.conditionsForAcceptance,
      });
      await program
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
      const data = await Program.findOne({ _id: req.params.id });
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
      const data = await Program.find({ universityId: req.params.id }).sort({
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
      const data = await Program.find().sort({ createdAt: -1 });
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
      const updated = await Program.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            universityId: req.body.universityId,
            name: req.body.name,
            levelOfStudy: req.body.levelOfStudy,
            description: req.body.description,
            duration: req.body.duration,
            applicationDeadline: req.body.applicationDeadline,
            location: req.body.location,
            admissionRequirements: req.body.admissionRequirements,
            conditionsForAcceptance: req.body.conditionsForAcceptance,
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
      const response = await Program.deleteOne({ _id: req.params.id });
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

export default ProgramController;
