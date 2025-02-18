import ffmpeg, { ffprobe } from "fluent-ffmpeg";
import { isMainThread, parentPort, workerData } from "worker_threads";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";
import { APIError } from "../../../shared/utils/error";
import path from "path";
import { exists } from "../../../shared/utils/file_exists";

const __filename = fileURLToPath(import.meta.url);

ffmpeg.setFfmpegPath(require("ffmpeg-static"));
ffmpeg.setFfprobePath(require("ffprobe-static").path);

/**
 * @param {{format: string, input: string, output: string, size: number}} options
 */
async function convert_video(options) {
    const { format, input, output, size } = options;
    const is_exists = await exists(input);
    if (!is_exists) {
        throw new APIError(`Input file not found! Path: ${input}`);
    }

    const duration = await get_video_duration(input);
    return new Promise((res, rej) => {
        ffmpeg()
            // set input file path
            .input(input)
            // set output file path
            .output(output)

            // set codec
            .videoCodec("libx264")
            // ultrafast because with default value it's gonna take 20min for 2.5Gb MOV file
            .addOption("-preset", "ultrafast")
            // set output format
            .toFormat(format)
            // Set compressing
            // For x264 your valid range is 0-51:
            .addOption("-crf", "23")
            .on("start", () => {
                calc_percent("00:00:00", duration, path.basename(output));
            })
            .on("progress", (result) => {
                calc_percent(result.timemark, duration, path.basename(output));
            })
            // on finish convert
            .on("end", () => {
                res();
            })
            // on error while converting
            .on("error", (err) => {
                console.log("err", err);
                rej(err);
            })
            // convert the video
            .run();
    });
}

/**
 * @param {`${string}:${string}:${string}`} time
 * @param {number} duration
 * @param {string} bar
 */
const calc_percent = (time, duration, bar) => {
    const currentTime = parse_time_to_seconds(time);

    // Calculate percentage
    const percent = duration > 0 ? Math.min(100, (currentTime / duration) * 100).toFixed(2) : 0;

    console.log(bar, Math.min(Math.max(0, percent), 100));
};

/**
 * @param {string} input
 * @returns {Promise<number>}
 */
function get_video_duration(input) {
    console.log(`input, ${input}`);
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(input, (err, metadata) => {
            if (err) {
                reject(err);
            }
            resolve(metadata.format.duration || 0);
        });
    });
}

/**
 * parse "HH:MM:SS" to number string
 * @param {`${string}:${string}:${string}`} time
 * @returns
 */
function parse_time_to_seconds(time) {
    const parts = time.split(":");
    return (
        parseInt(parts[0]) * 3600 + // hours
        parseInt(parts[1]) * 60 + // min
        parseFloat(parts[2]) // sec
    );
}

export function create_converter_worker(task) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
            workerData: task,
        });
        worker.on("message", (result) => {
            if (result.success) resolve(result.outputPath);
            else reject(new APIError(JSON.stringify(result), 500));

            worker.terminate();
        });
        worker.on("error", reject);
        worker.on("exit", (code) => {
            if (code !== 0) reject(new APIError(`Worker stopped with exit code ${code}`, 500));
        });
    });
}

// If this main thread do nothing
if (!isMainThread) {
    // Otherwise convert video
    convert_video(workerData)
        .then(() => {
            // emit event to parent thread
            parentPort.postMessage({ success: true, output: workerData.output });
        })
        .catch((error) => {
            console.log(error);
            // emit event to parent thread on error
            parentPort.postMessage({
                success: false,
                message: error instanceof Error ? error.message : JSON.stringify(error),
            });
        });
}
