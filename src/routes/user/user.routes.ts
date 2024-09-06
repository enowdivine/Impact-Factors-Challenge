import express from "express";
import User from "./user.controller";
import userAuth from "../../middleware/auth/user";

const router = express.Router();
const user = new User();

router.post("/register", user.register);
router.post("/login", user.login);

router.get("/:id", userAuth, user.user);
router.get("/", userAuth, user.users);
router.get("/:id/likes", userAuth, user.likedUsers);

router.put("/update/:id", userAuth, user.update);
router.put("/update-password/:id", userAuth, user.updatePassword);

router.delete("/delete/:id", userAuth, user.deleteUser);

export default router;
