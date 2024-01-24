import express, { Router } from "express";
import Gallery from "./gallery.controller";

const router: Router = express.Router();
const gallery = new Gallery();

router.post("/create", gallery.create);
router.get("/", gallery.reads);
router.put("/update", gallery.update);

export default router;
