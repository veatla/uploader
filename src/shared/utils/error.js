export class APIError extends Error {
    status = 500;

    /**
     * @param {string} message 
     * @param {number} status
     */
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}
