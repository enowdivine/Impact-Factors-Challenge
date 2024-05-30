import { Request, Response } from "express";
import University from "./data.model";

class UniversityController {
  async create(req: Request, res: Response) {
    try {
      const university = new University({
        name: req.body.name,
        image: req.body.image,
        letterHead: req.body.letterHead,
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
      const data = await University.findOne({ _id: req.params.id });
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
      const data = await University.find().sort({ createdAt: -1 });
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
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const updated = await University.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            name: req.body.name,
            image: req.body.image,
            letterHead: req.body.letterHead,
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
    } catch (error) {
      console.error("error deleting data", error);
      return res.status(500).json({
        message: "error deleting data",
      });
    }
  }
}

export default UniversityController;
