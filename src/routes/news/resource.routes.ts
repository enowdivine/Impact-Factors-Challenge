import express, { Router } from "express";
import Resource from "./resource.controller";
//
import fileUpload from "express-fileupload";
import fileExtLimiter from "../../middleware/fileUpload/fileExtLimiter";
import fileSizeLimiter from "../../middleware/fileUpload/fileSizeLimiter";
import filesPayloadExists from "../../middleware/fileUpload/filePayloadExists";

const router: Router = express.Router();
const resource = new Resource();

router.post(
  "/create",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  resource.create
);
router.get("/:id", resource.readOne);
router.get("/", resource.read);
router.put(
  "/update/:id",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  resource.update
);
router.delete("/delete/:id", resource.deleteItem);

export default router;
