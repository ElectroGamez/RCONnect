import { ErrorRequestHandler, NextFunction, Request, Response } from "express";

import express from "express";

import server from "./routes/server";
import user from "./routes/user";

/**
 * Express Error handler, used to give more detailed errors to the end user.
 *
 * @export
 * @class RequestError
 * @extends {Error}
 */
export class RequestError extends Error {
    /**
     * Creates an instance of RequestError.
     * @param {string} message The message we want to send to the enduser. This might be used as a title on a webinterface.
     * @param {Record<string, unknown>} [payload] Extra informations to give to the enduser.
     * @param {number} [httpStatusCode] HTTP statuscodes, used for returning a statuscode to the enduser.
     * @param {number} [statusCode] Internal statuscode, used for custom error codes.
     * @memberof RequestError
     */
    constructor(
        message: string,
        payload?: Record<string, unknown>,
        httpStatusCode?: number,
        statusCode?: number
    ) {
        super(message);

        this.payload = payload;
        this.httpStatusCode = httpStatusCode;
        this.statusCode = statusCode;
    }

    payload?: Record<string, unknown>;
    httpStatusCode?: number;
    statusCode?: number;
}

/**
 * Error handler for express functions, will be called if a error is thrown inside of a express request function.
 */
export const errorHandler: ErrorRequestHandler = (
    err: RequestError,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(err);

    res.status(err.httpStatusCode || 500).json({
        message: err.message,
        payload: err.payload,
        statusCode: err.statusCode,
        stack: process.env.NODE_ENV == "development" ? err.stack : "🐝",
    });

    next();
};

export const startServer = (port?: number): void => {
    const app = express();
    app.use(express.json());
    
    app.use("/server", server);
    app.use("/user", user);
        
    port = port || 3000;
    
    app.use(errorHandler);
    app.listen(port, async () => {
        console.log("Running backend on " + port);
    });
};
