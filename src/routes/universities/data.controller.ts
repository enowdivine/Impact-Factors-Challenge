import { Request, Response } from "express";
import University from "./data.model";
import Application from "../applications/data.model";
import Program from "../programs/data.model";

class UniversityController {
  async create(req: Request, res: Response) {
    try {
      const uniCheck = await University.findOne({
        abbreviation: req.body.abbreviation,
      });
      if (uniCheck) {
        return res.status(401).json({
          message: "abbreviation already exist",
        });
      }
      const university = new University({
        name: req.body.name,
        abbreviation: req.body.abbreviation,
        image: req.body.image,
        letterHead: req.body.letterHead,
        coverPhoto: req.body.coverPhoto,
        location: {
          city: req.body.location.city,
          stateOrProvince: req.body.location.stateOrProvince,
          country: req.body.location.country,
        },
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        contactInformation: {
          phone: req.body.contactInformation.phone,
          email: req.body.contactInformation.email,
        },
        paymentDetails: {
          bankTransfer: {
            nameOfBank: req.body.paymentDetails.bankTransfer.nameOfBank,
            accountNumber: req.body.paymentDetails.bankTransfer.accountNumber,
          },
          mobileMoney: req.body.paymentDetails.mobileMoney,
        },
        signatory: req.body.signatory,
      });
      await university
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
      const data = await University.findOne({ _id: req.params.id });
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
      const data = await University.find().sort({ createdAt: -1 });
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

  async assignedUniversities(req: Request, res: Response) {
    try {
      const data = await University.find({
        _id: { $in: req.query.universityIds },
      }).sort({
        createdAt: -1,
      });
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

  async featuredUniversities(req: Request, res: Response) {
    try {
      const universities = await University.find({ featured: true }).sort({
        createdAt: -1,
      });
      if (!universities.length) {
        return res.status(404).json({ message: "No universities found" });
      }
      const universitiesWithProgramCount = await Promise.all(
        universities.map(async (university) => {
          const programCount = await Program.countDocuments({
            universityId: university._id,
          });
          return {
            ...university.toObject(), // Convert Mongoose document to plain object
            programCount,
          };
        })
      );

      return res.status(200).json(universitiesWithProgramCount);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching data" });
    }
  }

  // async cities(req: Request, res: Response) {
  //   try {
  //     const uniqueCities = await University.distinct("location.city");
  //     if (uniqueCities && uniqueCities.length > 0) {
  //       return res.status(200).json(uniqueCities);
  //     } else {
  //       return res.status(404).json({
  //         message: "No cities found",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data", error);
  //     return res.status(500).json({
  //       message: "Error fetching data",
  //     });
  //   }
  // }
  async cities(req: Request, res: Response) {
    try {
      const cityData = await University.aggregate([
        {
          $group: {
            _id: "$location.city",
            universityCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            city: "$_id",
            universityCount: 1,
          },
        },
      ]);

      if (cityData && cityData.length > 0) {
        return res.status(200).json(cityData);
      } else {
        return res.status(404).json({
          message: "No cities found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching data",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      if (req.body.abbreviation) {
        const uniCheck = await University.findOne({
          _id: req.params.id,
        });
        if (uniCheck) {
          if (uniCheck.abbreviation !== req.body.abbreviation) {
            const secondCheck = await University.findOne({
              abbreviation: req.body.abbreviation,
            });
            if (secondCheck) {
              return res.status(401).json({
                message: "Abbreviation already exist",
              });
            }
          }
        }
      }

      const applicationUpdate = await Application.updateOne(
        {
          universityId: req.params.id,
        },
        {
          $set: {
            name: req.body.name,
          },
        }
      );
      const updated = await University.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            name: req.body.name,
            abbreviation: req.body.abbreviation,
            image: req.body.image,
            letterHead: req.body.letterHead,
            coverPhoto: req.body.coverPhoto,
            location: {
              city: req.body.location.city,
              stateOrProvince: req.body.location.stateOrProvince,
              country: req.body.location.country,
            },
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            contactInformation: {
              phone: req.body.contactInformation.phone,
              email: req.body.contactInformation.email,
            },
            paymentDetails: {
              bankTransfer: {
                nameOfBank: req.body.paymentDetails.bankTransfer.nameOfBank,
                accountNumber:
                  req.body.paymentDetails.bankTransfer.accountNumber,
              },
              mobileMoney: req.body.paymentDetails.mobileMoney,
            },
            signatory: req.body.signatory,
            featured: req.body.featured,
            hasSchorlaships: req.body.hasSchorlaships,
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
        message: error.message || "Error updating data",
      });
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const response = await University.deleteOne({ _id: req.params.id });
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
}

export default UniversityController;
