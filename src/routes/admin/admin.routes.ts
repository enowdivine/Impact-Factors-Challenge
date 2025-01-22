import express from "express";
import Admin from "./admin.controller";

const router = express.Router();
const admin = new Admin();

router.post("/register", admin.register);
router.post("/login", admin.login);
router.post("/new-password", admin.newPassword);

router.get("/:id", admin.admin);

router.put("/update/:id", admin.updateAdmin);
router.put("/update-password/:id", admin.updatePassword);

router.delete("/delete/:id", admin.deleteAdmin);

export default router;
