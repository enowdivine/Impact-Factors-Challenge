import express, { Router } from "express";
import University from "./data.controller";
import userAuth from "../../middleware/auth/user";

const router: Router = express.Router();
const university = new University();

router.post("/create", userAuth, university.create);
router.get("/details/:id", userAuth, university.readOne);
router.get("/universities/:id", userAuth, university.readByUniversityId);
router.get("/", userAuth, university.read);
router.get("/program-with-university", university.readWithUniversity);
router.put("/update/:id", userAuth, university.update);
router.delete("/delete/:id", userAuth, university.deleteItem);

export default router;
