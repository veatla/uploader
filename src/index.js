import express from "express";
import cors from "cors";
import helmet from "helmet";
import * as http from "http";
import * as fs from "fs";
import uploadController from "./components/upload/upload.controller.js";
import { ENV } from "./config/env.js";
import { apiReference } from "@scalar/express-api-reference";
import path from "path";
import urlJoin from "url-join";

// Create dir if not exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("static")) fs.mkdirSync("static");

const app = express();

app.use(cors());
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'", "https://cdn.jsdelivr.net"],
            },
        },
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hi");
});

app.use("/upload", uploadController);
app.use("/docs/openapi", express.static('docs/openapi.yml'));

app.use(
    "/docs",
    apiReference({
        spec: {
            // Put your OpenAPI url here:
            url: urlJoin(ENV.API_BASE_URL, "/docs/openapi"),
        },
    })
);

app.use(
    /**
     * @param {import('./shared/utils/error.js').APIError} err
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    (err, req, res, next) => {
        res.status(err.status ?? 500).send({ message: err.message });
    }
);

const server = http.createServer(app);
const listener = server.listen(ENV.PORT, () => {
    const address = listener.address();
    if (typeof address === "string") process.exit(1);
    console.log(`Server started on http://localhost:${address?.port}`);
    console.log(`Base url is ${ENV.API_BASE_URL}`);
});
