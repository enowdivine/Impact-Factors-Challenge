import { Request, Response } from "express";
import Booking from "./booking.model";
import { generateRandomCode } from "../../helpers/RandomCode";
import sendEmail from "../../services/email/sendEmail";

class BookingController {
  async create(req: Request, res: Response) {
    try {
      const randomCode = generateRandomCode();
      const booking = new Booking({
        username: req.body.username,
        phoneNumber: req.body.phoneNumber,
        roomId: req.body.roomId,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        guest: req.body.guest,
        amount: req.body.amount,
        paymentStatus: req.body.paymentStatus,
        verificationCode: randomCode,
      });
      await booking
        .save()
        .then(async () => {
          sendEmail({
            to: "sirdivine16@gmail.com",
            subject: "New Booking From Gilgal Towers Website",
            message: "",
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "error making booking",
            error: err,
          });
        });
    } catch (error) {
      console.error("error making booking", error);
    }
  }

  async booking(req: Request, res: Response) {
    try {
      const booking = await Booking.findOne({ _id: req.params.id });
      if (booking) {
        return res.status(200).json(booking);
      } else {
        return res.status(404).json({
          message: "booking not found",
        });
      }
    } catch (error) {
      console.error("error fetching booking", error);
    }
  }

  async roomBookings(req: Request, res: Response) {
    try {
      const rooms = await Booking.find({
        roomId: req.params.roomId,
      }).sort({ createdAt: -1 });
      if (rooms) {
        return res.status(200).json(rooms);
      } else {
        return res.status(404).json({
          message: "No room found",
        });
      }
    } catch (error) {
      console.error("error fetching rooms", error);
    }
  }

  async bookings(req: Request, res: Response) {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      if (bookings) {
        return res.status(200).json(bookings);
      } else {
        return res.status(404).json({
          message: "no booking found",
        });
      }
    } catch (error) {
      console.error("error fetching booking", error);
    }
  }

  async extendEndDate(req: Request, res: Response) {
    try {
      const response = await Booking.updateOne(
        {
          _id: req.params.id,
        },
        {
          $set: {
            checkOut: req.body.checkOut,
          },
        }
      );
      if (response.acknowledged) {
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(404).json({
          message: "booking not found",
        });
      }
    } catch (error) {
      console.error("error updating booking", error);
    }
  }
}

export default BookingController;
