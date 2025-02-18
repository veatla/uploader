/**
 * @param {(req: import('express').Request, res: import('express').Response) => Promise} fn
 */
export function catcher(fn) {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    return async function execute(req, res, next) {
        try {
            await fn(req, res);
        } catch (err) {
            next(err);
        }
    };
}
