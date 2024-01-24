import { Request, Response } from "express";
import Room from "./room.model";
import slugify from "../../helpers/slugify";
import { uploadImages, deleteImage } from "../../helpers/UploadFile";

class RoomController {
  async create(req: Request, res: Response) {
    try {
      const files: any = req.files;
      await uploadImages(files, "uploads/rooms", res);

      const allFiles: any[] = Object.entries(files);
      const images: any[] = [];
      allFiles.map((item) => images.push(item[1].name));

      const slug = slugify(req.body.title);
      const room = new Room({
        title: req.body.title,
        slug: slug,
        images: images,
        price: req.body.price,
        size: req.body.size,
        capacity: req.body.capacity,
        bed: req.body.bed,
        services: req.body.services,
        desc: req.body.desc,
      });
      await room
        .save()
        .then(() => {
          res.status(201).json({
            message: "room created",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "error creating room",
            error: err,
          });
        });
    } catch (error) {
      console.error("error uploading resource", error);
      return res.status(500).json({
        message: "error creating room",
      });
    }
  }

  async readOne(req: Request, res: Response) {
    try {
      const room = await Room.findOne({ _id: req.params.id });
      if (room) {
        return res.status(200).json(room);
      } else {
        return res.status(404).json({
          message: "room not found",
        });
      }
    } catch (error) {
      console.error("error fetching room", error);
      return res.status(500).json({
        message: "error fetching room",
      });
    }
  }

  async read(req: Request, res: Response) {
    try {
      const rooms = await Room.find().sort({ createdAt: -1 });
      if (rooms) {
        return res.status(200).json(rooms);
      } else {
        return res.status(404).json({
          message: "no room found",
        });
      }
    } catch (error) {
      console.error("error fetching rooms", error);
      return res.status(500).json({
        message: "error fetching rooms",
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const files: any = req.files;
      await uploadImages(files, "uploads/rooms", res);

      const allFiles: any[] = Object.entries(files);
      const images: any[] = [];
      allFiles.map((item) => images.push(item[1].name));

      const slug = slugify(req.body.title);
      const updatedResource = await Room.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            title: req.body.title,
            slug: slug,
            images: req.body.images,
            price: req.body.price,
            size: req.body.size,
            capacity: req.body.capacity,
            bed: req.body.bed,
            services: req.body.services,
            desc: req.body.desc,
          },
          $push: {
            images: {
              $each: images,
            },
          },
        }
      );
      if (updatedResource.acknowledged) {
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(404).json({
          message: "resource not found",
        });
      }
    } catch (error) {
      console.error("error updating resource", error);
      return res.status(500).json({
        message: "error updating resources",
      });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const room = await Room.findOne({ _id: req.params.id });
      if (room) {
        room.status = req.body.status;
        await room.save().then(async () => {
          return res.status(200).json({
            message: "room status updated",
          });
        });
      } else {
        return res.status(404).json({
          message: "room not found",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "an error occurred",
      });
    }
  }

  async deleteRoom(req: Request, res: Response) {
    try {
      const room = await Room.findOne({ _id: req.params.id });
      if (room) {
        if (room.images.length > 0) {
          room.images.map(async (item) => {
            await deleteImage("uploads/rooms", item);
          });
        }
      }
      const response = await Room.deleteOne({ _id: req.params.id });
      if (response.deletedCount > 0) {
        res.status(200).json({
          message: "room deleted",
        });
      } else {
        res.status(404).json({
          message: "room not found",
        });
      }
    } catch (error) {
      console.error("error deleting room", error);
      return res.status(500).json({
        message: "error deleting room",
      });
    }
  }

  async advancedSearch(req: Request, res: Response) {
    try {
      const searchPhrase = req.params.data;

      const agg: any[] = [
        {
          $search: {
            index: "searchRooms",
            text: {
              query: searchPhrase,
              path: {
                wildcard: "*",
              },
              fuzzy: {},
            },
          },
        },
      ];

      const rooms = await Room.aggregate(agg);
      if (rooms) {
        res.status(200).json(rooms);
      } else {
        res.status(404).json({
          message: "no rooms found",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "an error occurred",
      });
    }
  }
}

export default RoomController;
