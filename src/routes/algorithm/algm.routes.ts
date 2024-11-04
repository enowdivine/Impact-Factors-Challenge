import express from "express";
import Algorithm from "./algm.controller";

const router = express.Router();
const algm = new Algorithm();

router.post("/generate-users", algm.generateUsers);
router.get("/users", algm.users);

export default router;
