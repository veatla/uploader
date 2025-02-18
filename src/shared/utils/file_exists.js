import fs from "fs/promises";

/**
 * @param {string} path 
 * @returns {Promise<boolean>}
 */
export async function exists(path) {
    try {
        const stat = await fs.stat(path);
        return Boolean(stat);
    } catch {
        return false;
    }
}
