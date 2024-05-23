import express, { Router } from "express";
import University from "./data.controller";
import userAuth from "../../middleware/auth/user";

const router: Router = express.Router();
const university = new University();

router.post("/create", userAuth, university.create);
router.get("/:id", userAuth, university.readOne);
router.get("/", userAuth, university.read);
router.put("/update/:id", userAuth, university.update);
router.delete("/delete/:id", userAuth, university.deleteItem);

export default router;
