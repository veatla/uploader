import { Router } from "express";
import storage from "../../config/multer.js";
import { create_converter_worker } from "./service/converter.service.js";
import path from "path";
import fs from "fs/promises";
import { APIError } from "../../shared/utils/error.js";
import { ENV } from "../../config/env.js";
import urlJoin from "url-join";
import { exists } from "../../shared/utils/file_exists.js";
import { catcher } from "../../shared/utils/cathcer.js";

const uploadController = Router();

uploadController.post(
    "/",
    storage.single("file"),
    catcher(async (req, res) => {
        const file = req.file;
        if (!file) throw new APIError("Expected file");

        const saved_path = path.join(process.cwd(), file.destination, file.filename);
        const basename = path.basename(file.originalname, path.extname(file.originalname));
        const format = "mp4";
        const output = `${file.filename}-${basename}.${format}`;

        await create_converter_worker({
            format: format,
            input: saved_path,
            output: path.join(process.cwd(), "static", output),
            size: file.size,
        })
            .catch((err) => {
                console.log(`Error while trying to convert video`, err);
                throw err;
            })
            .finally(() => {
                fs.unlink(saved_path, (err) => {
                    if (err === null) console.log("Original file removed from uploaded files list");
                    else console.log("Unable to delete original file", err);
                });
            });

        // support files more than 1-2 GB
        // async convert file to mp4 to prevent blocking main thread
        // after convert
        // return error message if there's an error while converting
        // create temporary file link to download converted file
        // return link to download converted
        res.send({
            link: urlJoin(ENV.API_BASE_URL, "upload", output),
        });
    })
);

uploadController.get(
    "/:filename",
    catcher(async (req, res) => {
        const filename = req.params.filename;

        const converted = path.join(process.cwd(), "static", filename);

        // if not found return 404
        const is_exists = await exists(converted);
        if (!is_exists) throw new APIError("Not Found!", 404);

        res.download(converted, async (err) => {
            if (err) {
                console.log(err);
                throw new APIError("Something gone wrong while trying to download video!", 500);
            }
            // after download delete files
            await fs.unlink(converted);
        });
    })
);

// add examples to how to use this an API
export default uploadController;
