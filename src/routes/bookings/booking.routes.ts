import express, { Router } from "express";
import Booking from "./booking.controller";

const router: Router = express.Router();
const booking = new Booking();

router.post("/create", booking.create);
router.get("/:id", booking.booking);
router.get("/:roomId", booking.roomBookings);
router.get("/", booking.bookings);
router.get("/extend", booking.extendEndDate);

export default router;
