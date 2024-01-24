import { Request, Response } from "express";
import Rating from "./rating.model";
import resourceModel from "../rooms/room.model";

class RatingController {
  async create(req: Request, res: Response) {
    try {
      const rating = new Rating({
        resourceId: req.body.resourceId,
        userId: req.body.userId,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      await rating
        .save()
        .then(async () => {
          const resourceRatings = await Rating.find({
            resourceId: req.body.resourceId,
          });

          // calculate rating
          if (resourceRatings && resourceRatings.length > 0) {
            let count = 0;
            resourceRatings.forEach((item: any) => {
              return (count += item.rating);
            });
            const newRate =
              Math.round((count / resourceRatings.length) * 10) / 10;
            // resource update
            const resource = await resourceModel.updateOne(
              {
                _id: req.body.resourceId,
              },
              {
                $set: {
                  rating: newRate,
                },
              }
            );
            if (resource.acknowledged) {
              res.status(201).json({
                message: "Thank you for rating this resource",
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
            message: "error rating resource",
            error: err,
          });
        });
    } catch (error) {
      console.error("error rating resource", error);
    }
  }

  async ratings(req: Request, res: Response) {
    try {
      const ratings = await Rating.find({
        resourceId: req.params.id,
      });
      if (ratings) {
        return res.status(200).json(ratings);
      } else {
        return res.status(404).json({
          message: "no ratings found",
        });
      }
    } catch (error) {
      console.error("error fetching ratings", error);
    }
  }
}

export default RatingController;
