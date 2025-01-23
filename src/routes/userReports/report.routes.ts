import express from "express";
import Report from "./report.controller";

const router = express.Router();
const report = new Report();

router.post("/new-report", report.createReport);

router.get("/", report.reports);
router.get("/:id", report.report);

router.put("/update-status/:id", report.updateStatus);

router.delete("/delete-report/:id", report.deleteReport);

export default router;
