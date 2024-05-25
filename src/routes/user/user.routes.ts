import express from "express";
import User from "./user.controller";
import userAuth from "../../middleware/auth/user";

const router = express.Router();
const user = new User();

router.post("/register", userAuth, user.register);
router.post("/login", user.login);

router.get("/details/:id", userAuth, user.user);
router.get("/students", userAuth, user.students);
router.get("/admin-officers", userAuth, user.adminOfficers);

router.put("/update/:id", userAuth, user.update);
router.put("/update-password/:id", userAuth, user.updatePassword);

router.delete("/delete/:id", userAuth, user.deleteUser);

export default router;
