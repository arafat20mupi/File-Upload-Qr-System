import { NextFunction, Request, Response } from "express"

import httpStatus from "http-status"
import { Secret } from "jsonwebtoken";
import { jwtHelper } from "../app/helpers/jwtHelper";
import ApiError from "../app/errors/ApiErrors";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {

            const token = req.cookies["next-auth.session-token"] || req.cookies["__Secure-next-auth.session-token"];
            console.log(token);
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!")
            }

            const verifyUser = jwtHelper.verifyToken(token, process.env.JWT_SECRET as Secret);
            req.user = verifyUser;


            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!")
            }

            next();
        }
        catch (err) {
            next(err)
        }
    }
}

export default auth;