import { Request, Response } from "express";
import Resource from "./resource.model";
import slugify from "../../helpers/slugify";
import { uploadImages, deleteImage } from "../../helpers/UploadFile";

class EventController {
  async create(req: Request, res: Response) {
    try {
      const files: any = req.files;
      await uploadImages(files, "uploads/gallery", res);

      const allFiles: any[] = Object.entries(files);
      const images: any[] = [];
      allFiles.map((item) => images.push(item[1].name));

      const slug = slugify(req.body.name);
      const member = new Resource({
        image: images[0],
        name: req.body.name,
        slug: slug,
        profession: req.body.profession,
        details: req.body.details,
        isManagement: req.body.isManagement,
        isFrench: req.body.isFrench,
      });
      await member
        .save()
        .then(() => {
          res.status(201).json({
            message: "created",
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
      const member = await Resource.findOne({ _id: req.params.id });
      if (member) {
        return res.status(200).json(member);
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
      const team = await Resource.find().sort({ createdAt: -1 });
      if (team) {
        return res.status(200).json(team);
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
      const files: any = req.files;
      if (files) {
        await uploadImages(files, "uploads/gallery", res);

        const allFiles: any[] = Object.entries(files);
        const images: any[] = [];
        allFiles.map((item) => images.push(item[1].name));

        const slug = slugify(req.body.title);
        const updatedResource = await Resource.updateOne(
          {
            _id: req.params.id,
          },
          {
            $set: {
              image: images[0],
              name: req.body.name,
              slug: slug,
              profession: req.body.profession,
              details: req.body.details,
              isManagement: req.body.isManagement,
              isFrench: req.body.isFrench,
            },
          }
        );
        if (updatedResource.acknowledged) {
          res.status(200).json({
            message: "success",
          });
        } else {
          res.status(404).json({
            message: "an error occured",
          });
        }
      } else {
        const slug = slugify(req.body.title);
        const updatedResource = await Resource.updateOne(
          {
            _id: req.params.id,
          },
          {
            $set: {
              name: req.body.name,
              slug: slug,
              profession: req.body.profession,
              details: req.body.details,
              isManagement: req.body.isManagement,
              isFrench: req.body.isFrench,
            },
          }
        );
        if (updatedResource.acknowledged) {
          res.status(200).json({
            message: "success",
          });
        } else {
          res.status(404).json({
            message: "an error occured",
          });
        }
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
      const member = await Resource.findOne({ _id: req.params.id });
      if (member) {
        await deleteImage("uploads/gallery", member.image);
      }
      const response = await Resource.deleteOne({ _id: req.params.id });
      if (response.deletedCount > 0) {
        res.status(200).json({
          message: "member deleted",
        });
      } else {
        res.status(404).json({
          message: "member not found",
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

export default EventController;
