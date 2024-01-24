import express, { Router } from "express";
import Room from "./room.controller";
//
import fileUpload from "express-fileupload";
import fileExtLimiter from "../../middleware/fileUpload/fileExtLimiter";
import fileSizeLimiter from "../../middleware/fileUpload/fileSizeLimiter";
import filesPayloadExists from "../../middleware/fileUpload/filePayloadExists";

const router: Router = express.Router();
const room = new Room();

router.post(
  "/create",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  room.create
);
router.get("/:id", room.readOne);
router.get("/", room.read);
router.put(
  "/update-room/:id",
  fileUpload({ createParentPath: true }),
  filesPayloadExists,
  fileExtLimiter([".png", ".jpg", ".jpeg"]),
  fileSizeLimiter,
  room.update
);
router.put("/update-status/:id", room.updateStatus);
router.delete("/delete-roon/:id", room.deleteRoom);
router.get("/fuzzy-search/:data", room.advancedSearch);

export default router;
