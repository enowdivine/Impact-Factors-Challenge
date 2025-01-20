import express from "express";
import Report from "./report.controller";

const router = express.Router();
const report = new Report();

router.post("/new-report", report.createReport);
router.post("/reports", report.reports);
router.post("/report/:id", report.report);
router.post("/update-status/:id", report.updateStatus);
router.post("/delete-report/:id", report.deleteReport);

export default router;
