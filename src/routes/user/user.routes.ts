import express from "express";
import User from "./user.controller";
import userAuth from "../../middleware/auth/user";

const router = express.Router();
const user = new User();

router.post("/register", user.register);
router.post("/verify-email", user.verifyEmail);
router.post("/login", user.login);
router.post("/forgot-password", user.forgotPassword);
router.post("/new-password", user.newPassword);

router.get("/:id", user.user);
router.get("/", user.users);
router.get("/:id/likes", user.likedUsers);

router.put("/update/:id", user.update);
router.put("/update-password/:id", user.updatePassword);

router.delete("/delete/:id", user.deleteUser);

export default router;
