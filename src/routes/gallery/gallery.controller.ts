import { Request, Response } from "express";
const path = require("path");
const fs = require("fs");
import { uploadImages, deleteImage } from "../../helpers/UploadFile";

class FacultyController {
  async create(req: Request, res: Response) {
    const files: any = req.files;
    await uploadImages(files, "uploads/gallery", res);
  }

  async reads(req: Request, res: Response) {
    try {
      // Read the contents of the image folder
      fs.readdir("uploads/gallery", (err: any, files: any) => {
        if (err) {
          return res.status(500).send("Error reading image folder");
        }

        // Filter out only image files (you can customize the filter as needed)
        const imageFiles = files.filter((file: any) => {
          const extname = path.extname(file).toLowerCase();
          return [".png", ".jpg", ".jpeg", ".gif"].includes(extname);
        });

        // Send the list of image files as JSON
        res.json({ images: imageFiles });
      });
    } catch (error) {
      console.error("error fetching faculties", error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const files: any = req.files;
      files.map(async (item: any) => {
        await deleteImage("uploads/gallery", item);
      });
    } catch (error) {
      console.error("error updating faculty", error);
    }
  }
}

export default FacultyController;
