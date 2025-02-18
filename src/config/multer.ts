import multer from "multer";

const storage = multer({
  storage: multer.diskStorage({
    destination: "uploads",
  }),
});

export default storage;