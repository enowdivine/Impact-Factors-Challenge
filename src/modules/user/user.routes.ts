import express from "express";
import UserController from "./user.controller";

const router = express.Router();
const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", userController.getProfile);

export default router;
