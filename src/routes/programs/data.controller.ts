import { Request, Response } from "express";
import Program from "./data.model";
import Application from "../applications/data.model";
import University from "../universities/data.model";

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

        awardingBody: req.body.awardingBody,
        tuitionFee: req.body.tuitionFee,
        initialDeposit: req.body.initialDeposit,
        otherFees: req.body.otherFees,
        teachingMode: req.body.teachingMode,
        teachingMethods: req.body.teachingMethods,
        mediumOfInstruction: req.body.mediumOfInstruction,
        academicYear: req.body.academicYear,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      });
      await program
        .save()
        .then(() => {
          res.status(201).json({
            message: "success",
          });
        })
        .catch((err: any) => {
          res.status(500).json({
            message: err.message || "An error occured",
            error: err,
          });
        });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "An error occured",
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
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
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
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async readByAssignedUniversities(req: Request, res: Response) {
    try {
      const data = await Program.find({
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
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
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
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async readWithUniversity(req: Request, res: Response) {
    try {
      const data = await Program.find()
        .populate({
          path: "universityId",
          model: University,
        })
        .sort({ createdAt: -1 })
        .exec();
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const applicationUpdate = await Application.updateOne(
        {
          programId: req.params.id,
        },
        {
          $set: {
            programName: req.body.name,
          },
        }
      );
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
            //
            awardingBody: req.body.awardingBody,
            tuitionFee: req.body.tuitionFee,
            initialDeposit: req.body.initialDeposit,
            otherFees: req.body.otherFees,
            teachingMode: req.body.teachingMode,
            teachingMethods: req.body.teachingMethods,
            mediumOfInstruction: req.body.mediumOfInstruction,
            academicYear: req.body.academicYear,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
          },
        }
      );
      if (applicationUpdate.acknowledged && updated.acknowledged) {
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(404).json({
          message: "an error occured",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error updated data",
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
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error deleting data",
      });
    }
  }

  async advancedSearch(req: Request, res: Response) {
    try {
      const {
        name,
        levelOfStudy,
        location,
        academicYear,
        tuitionFee,
        duration,
      } = req.query;

      const searchCriteria: any = {};

      const toRegExpArray = (query: any): RegExp[] => {
        if (!query) return [];
        if (Array.isArray(query)) {
          return query.map((q) => new RegExp(q, "i"));
        } else {
          return [new RegExp(query, "i")];
        }
      };

      const toNumberRangeArray = (
        query: any
      ): { $gte: number; $lte: number }[] => {
        if (!query) return [];
        if (Array.isArray(query)) {
          return query.map(([min, max]) => ({ $gte: min, $lte: max }));
        } else {
          return [{ $gte: query[0], $lte: query[1] }];
        }
      };

      if (name) {
        searchCriteria.name = { $in: toRegExpArray(name) };
      }
      if (levelOfStudy) {
        searchCriteria.levelOfStudy = { $in: toRegExpArray(levelOfStudy) };
      }
      if (location) {
        searchCriteria.location = { $in: toRegExpArray(location) };
      }
      if (academicYear) {
        if (Array.isArray(academicYear)) {
          searchCriteria.academicYear = {
            $in: (academicYear as string[]).map((year) => new Date(year)),
          };
        } else {
          searchCriteria.academicYear = {
            $in: [new Date(academicYear as string)],
          };
        }
      }
      if (tuitionFee) {
        searchCriteria.$or = toNumberRangeArray(tuitionFee).map((range) => ({
          tuitionFee: range,
        }));
      }
      if (duration) {
        searchCriteria.$or = toNumberRangeArray(duration).map((range) => ({
          duration: range,
        }));
      }

      const programs = await Program.find(searchCriteria)
        .populate({
          path: "universityId",
          model: University,
        })
        .sort({ createdAt: -1 });

      let relatedPrograms: any[] = [];
      if (name) {
        relatedPrograms = await Program.find({
          name: { $in: toRegExpArray(name) },
          _id: { $nin: programs.map((program) => program._id) },
        })
          .populate({
            path: "universityId",
            model: University,
          })
          .sort({ createdAt: -1 });
      }

      if (programs.length > 0 || relatedPrograms.length > 0) {
        return res.status(200).json({
          programs,
          relatedPrograms,
        });
      } else {
        return res.status(404).json({
          message: "No programs found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching data",
      });
    }
  }
}

export default ProgramController;
