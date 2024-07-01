import express, { Router } from "express";
import TranzakController from "./tranzak";
import userAuth from "../../middleware/auth/user";

const router: Router = express.Router();
const tranzak = new TranzakController();

router.post("/tranzak", userAuth, tranzak.makePayment);

router.get("/", userAuth, tranzak.read);
router.get("/student/:id", userAuth, tranzak.readByStudentId);
router.get("/application/:id", userAuth, tranzak.readByApplicationId);

export default router;
