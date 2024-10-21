import express from "express";
import User from "./user.controller";
import userAuth from "../../middleware/auth/user";

const router = express.Router();
const user = new User();

router.post("/register", user.register);
router.post("/verify-email", user.verifyEmail);
router.post("/email-verification", user.emailVerification);
router.post("/login", user.login);
router.post("/forgot-password", user.forgotPassword);
router.post("/new-password", user.newPassword);

router.get("/:id", user.user);
router.get("/:id/list", user.users);
router.get("/:id/likes", user.likedUsers);
router.get("/:id/likes-me", user.likedMeUsers);
router.get("/:id/two-best-matches", user.twoBestMatches);
router.get("/:id/mutual-liked-users", user.mutualLikedUsers);

router.put("/like/:userId/:likedUserId", user.toggleLikeUser);

router.put("/update/:id", user.update);
router.put("/update-image/:id", user.updateImage);
router.put("/update-password/:id", user.updatePassword);

router.delete("/delete-image/:id", user.deleteImage);
router.delete("/delete/:id", user.deleteUser);

export default router;
