const path = require("path");
const fs = require("fs");
import { appRoot } from "../app";

export const uploadImages = async (
  files: any,
  uploadPath: string,
  res: any
) => {
  Object.keys(files).forEach((key) => {
    const filepath = path.join(appRoot, uploadPath, files[key].name);
    files[key].mv(filepath, (err: any) => {
      if (err)
        return res
          .status(500)
          .json({ message: "error uploading profile imag", error: err });
    });
  });
};

export const deleteImage = async (deletePath: any, filename: any) => {
  const filePathToDelete = path.join(__dirname, deletePath, filename);
  // Use fs.unlink to delete the file
  fs.unlink(appRoot, (err: any) => {
    if (err) {
      console.error(`Error deleting file: ${err.message}`);
    } else {
      console.log(`File ${filePathToDelete} deleted successfully.`);
    }
  });
};
