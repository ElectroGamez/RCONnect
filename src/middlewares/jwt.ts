import { NextFunction, Request, RequestHandler, Response } from "express";

import { verify, sign,  } from "jsonwebtoken";
import { User } from "../entities/User";

// TODO: Change this to config file & longer string
const clientSecret = "9780642378906432978604327869324";

/**
 * Express authentication middleware, using JWT.
 * Checks if token is valid and corosponds with an user.
 * 
 * @param req 
 * @param res 
 */
export const checkToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const token = <string>req.headers["authorization"]?.split(" ")[1];

    if (!token) return rejectClient(res);

    try {
        const userUUID = <string>verify(token, clientSecret); // Verify Token
        const user = await User.findOneOrFail(userUUID); // Token needs to match a valid User.

        res.locals.userId = user.id;
        next();
    } catch (error) {
        rejectClient(res);
    }
};

const rejectClient = (res: Response) => {
    res.status(401).json({
        message: "User is not authorized",
        payload: undefined,
    });
};

/**
 * JWT Token
 */
export type Token = string;

export const signToken = (user: User): Token => {
    return sign(user.id, clientSecret);
};