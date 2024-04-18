import express, { Router } from "express";
import Resource from "./resource.controller";

const router: Router = express.Router();
const resource = new Resource();

router.post("/create", resource.create);
router.get("/:id", resource.readOne);
router.get("/", resource.read);
router.put("/update/:id", resource.update);
router.delete("/delete/:id", resource.deleteItem);

export default router;
