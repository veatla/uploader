import multer from "multer";
import { APIError } from "../shared/utils/error";
const MOV_MIMETYPE = 'video/quicktime';

const storage = multer({
    storage: multer.diskStorage({
        destination: "uploads",
    }),
    fileFilter: (_, file, cb) => {
        const is_ok = file.mimetype === MOV_MIMETYPE;
        if (is_ok) return cb(null, true);
        else return cb(new APIError('Expected .MOV file!', 400), false)
    }
});

export default storage;
