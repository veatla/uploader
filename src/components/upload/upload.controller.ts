import { Router } from "express";
import storage from "../../config/multer";

const app = Router();

app.post("/", storage.single("file"), (req, res) => {
  const file = req.file;
  if (!file) throw new Error("Expected file");

  // support files more than 1-2 GB
  // async convert file to mp4 to prevent blocking main thread

  // after convert
  // return error message if there's an error while converting

  // create temporary file link to download converted file

  // return link to download converted
  res.send("Ok");
});

app.get("/:filename", (req, res) => {
  const filename = req.params.filename;
  // if not found return 404

  // after download delete files
  res.send(filename);
});

// add examples to how to use this an API