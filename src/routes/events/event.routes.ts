import express, { Router } from "express";
import Event from "./event.controller";

const router: Router = express.Router();
const event = new Event();

router.post("/create", event.create);
router.get("/:id", event.readOne);
router.get("/", event.read);
router.put("/update/:id", event.update);
router.delete("/delete/:id", event.deleteItem);

export default router;
