import type { Request, Response, NextFunction } from "express";
import {
	ForbiddenError,
	UnauthorizedError,
} from "../utils/errors/app.error.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { serverConfig } from "../config/index.ts";

interface DecodedJwtPayload extends JwtPayload {
	userId: string;
}

const authHandler = (req: Request, res: Response, next: NextFunction) => {
	try {
		// get the token from headers
		const authHeader = req.headers["authorization"];

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			throw new UnauthorizedError(
				"Access denied: No or invalid token has been provided",
			);
		}

		// verify the token
		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(
			token,
			serverConfig.JWT_SECRET_KEY,
		) as DecodedJwtPayload;

		// attach the user id to req. and then call the next middlewares
		req.userId = decoded.userId;
		next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw error;
		} else {
			throw new ForbiddenError(
				"Access denied: Invalid or expired token has been provided",
			);
		}
	}
};

export { authHandler };
