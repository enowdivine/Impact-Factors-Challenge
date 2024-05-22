import { Request, Response } from "express";
import Resource from "./resource.model";
import slugify from "../../helpers/slugify";

class ProgramController {
  async create(req: Request, res: Response) {
    try {
      const files: any = req.files;
      await uploadImages(files, "uploads/gallery", res);

      const allFiles: any[] = Object.entries(files);
      const images: any[] = [];
      allFiles.map((item) => images.push(item[1].name));

      const resource = new Resource({
        role: req.body.role,
        image: images[0],
        name: req.body.name,
        position: req.body.position,
        phone: req.body.phone,
        campus: req.body.campus,
        isFrench: req.body.isFrench,
      });
      await resource
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
      const resource = await Resource.findOne({ _id: req.params.id });
      if (resource) {
        return res.status(200).json(resource);
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
      const resources = await Resource.find().sort({ createdAt: -1 });
      if (resources) {
        return res.status(200).json(resources);
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

        const updatedResource = await Resource.updateOne(
          {
            _id: req.params.id,
          },
          {
            $set: {
              role: req.body.role,
              image: images[0],
              name: req.body.name,
              position: req.body.position,
              phone: req.body.phone,
              campus: req.body.campus,
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
              role: req.body.role,
              name: req.body.name,
              position: req.body.position,
              phone: req.body.phone,
              campus: req.body.campus,
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
      const resource = await Resource.findOne({ _id: req.params.id });
      if (resource) {
        await deleteImage("uploads/gallery", resource.image);
      }

      const response = await Resource.deleteOne({ _id: req.params.id });
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
