import express, { Router } from "express";
import Event from "./event.controller";
//
import fileUpload from "express-fileupload";
import fileExtLimiter from "../../middleware/fileUpload/fileExtLimiter";
import fileSizeLimiter from "../../middleware/fileUpload/fileSizeLimiter";
import filesPayloadExists from "../../middleware/fileUpload/filePayloadExists";

const router: Router = express.Router();
const event = new Event();

router.post(
  "/create",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  event.create
);
router.get("/:id", event.readOne);
router.get("/", event.read);
router.put(
  "/update/:id",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  event.update
);
router.delete("/delete/:id", event.deleteItem);

export default router;
