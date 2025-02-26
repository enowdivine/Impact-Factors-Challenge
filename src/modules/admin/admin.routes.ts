import express from "express";
import AdminController from "./admin.controller";

const router = express.Router();
const admin = new AdminController();

// ADMIN ROUTES
router.post("/register", admin.registerSuperAdmin);
router.post("/create-admin", admin.createAdmin);
router.post("/login", admin.login);
router.get("/:id", admin.getAdmin);
router.delete("/delete/:id", admin.deleteAdmin);

export default router;
