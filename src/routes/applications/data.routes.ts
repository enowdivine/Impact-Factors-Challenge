import express, { Router } from "express";
import Application from "./data.controller";
import userAuth from "../../middleware/auth/user";

const router: Router = express.Router();
const application = new Application();

router.post("/create", userAuth, application.create);
router.get("/details/:id", userAuth, application.readOne);
router.get("/universities/:id", userAuth, application.readByUniversityId);
router.get("/", userAuth, application.read);
router.put("/update/:id", userAuth, application.update);
router.delete("/delete/:id", userAuth, application.deleteItem);

export default router;
