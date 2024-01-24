import { Request, Response } from "express";
import Rating from "./rating.model";
import roomModel from "../rooms/room.model";

class RatingController {
  async create(req: Request, res: Response) {
    try {
      const rating = new Rating({
        roomId: req.body.roomId,
        username: req.body.username,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      await rating
        .save()
        .then(async () => {
          const roomRatings = await Rating.find({
            roomId: req.body.roomId,
          });

          // calculate rating
          if (roomRatings && roomRatings.length > 0) {
            let count = 0;
            roomRatings.forEach((item: any) => {
              return (count += item.rating);
            });
            const newRate = Math.round((count / roomRatings.length) * 10) / 10;
            // room update
            const room = await roomModel.updateOne(
              {
                _id: req.body.roomId,
              },
              {
                $set: {
                  rating: newRate,
                },
              }
            );
            if (room.acknowledged) {
              res.status(201).json({
                message: "Thank you for rating this room",
              });
            }
          } else {
            res.status(400).json({
              message: "an error occured",
            });
          }
        })
        .catch((err) => {
          res.status(500).json({
            message: "error rating room",
            error: err,
          });
        });
    } catch (error) {
      console.error("error rating room", error);
    }
  }

  async read(req: Request, res: Response) {
    try {
      const rooms = await Rating.find({
        roomId: req.params.id,
      });
      if (rooms) {
        return res.status(200).json(rooms);
      } else {
        return res.status(404).json({
          message: "no rooms found",
        });
      }
    } catch (error) {
      console.error("error fetching rooms", error);
    }
  }
}

export default RatingController;
