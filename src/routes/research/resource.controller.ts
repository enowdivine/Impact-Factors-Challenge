import { Request, Response } from "express";
import Research from "./resource.model";
import slugify from "../../helpers/slugify";
import { uploadImages, deleteImage } from "../../helpers/UploadFile";

class ResearchController {
  async create(req: Request, res: Response) {
    try {
      const files: any = req.files;
      await uploadImages(files, "uploads/gallery", res);

      const allFiles: any[] = Object.entries(files);
      const images: any[] = [];
      allFiles.map((item) => images.push(item[1].name));

      const slug = slugify(req.body.title);
      const research = new Research({
        image: images[0],
        title: req.body.title,
        slug: slug,
        category: req.body.category,
        location: req.body.location,
        summary: req.body.summary,
        details: req.body.details,
        date: req.body.date,
        link: req.body.link,
        isFrench: req.body.isFrench,
      });
      await research
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
      const research = await Research.findOne({ _id: req.params.id });
      if (research) {
        return res.status(200).json(research);
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
      const research = await Research.find().sort({ createdAt: -1 });
      if (research) {
        return res.status(200).json(research);
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
        const updatedResource = await Research.updateOne(
          {
            _id: req.params.id,
          },
          {
            $set: {
              image: images[0],
              title: req.body.title,
              slug: slug,
              category: req.body.category,
              location: req.body.location,
              summary: req.body.summary,
              details: req.body.details,
              date: req.body.date,
              link: req.body.link,
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
        const updatedResource = await Research.updateOne(
          {
            _id: req.params.id,
          },
          {
            $set: {
              title: req.body.title,
              slug: slug,
              category: req.body.category,
              location: req.body.location,
              summary: req.body.summary,
              details: req.body.details,
              date: req.body.date,
              link: req.body.link,
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
      const research = await Research.findOne({ _id: req.params.id });
      if (research) {
        await deleteImage("uploads/gallery", research.image);
      }
      const response = await Research.deleteOne({ _id: req.params.id });
      if (response.deletedCount > 0) {
        res.status(200).json({
          message: "Research deleted",
        });
      } else {
        res.status(404).json({
          message: "Research not found",
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

export default ResearchController;
