import express from "express";
import Admin from "./admin.controller";

const router = express.Router();
const admin = new Admin();

// ADMIN ROUTES --------------------------------
router.post("/register", admin.register);
router.post("/login", admin.login);
router.post("/new-password", admin.newPassword);

router.get("/:id", admin.admin);

router.put("/update/:id", admin.updateAdmin);
router.put("/update-password/:id", admin.updatePassword);

router.delete("/delete/:id", admin.deleteAdmin);

// USER ROUTES --------------------------------
router.get("/users", admin.listUsers);
router.get("/users/:id", admin.getUser);

router.put("/update-user-status/:id", admin.updateUserStatus);

export default router;
