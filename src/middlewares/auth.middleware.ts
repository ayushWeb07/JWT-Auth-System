import type { Request, Response, NextFunction } from "express";
import {
	ForbiddenError,
	UnauthorizedError,
} from "../utils/errors/app.error.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { serverConfig } from "../config/index.ts";
import { logger } from "../config/logger.config.ts";

interface DecodedJwtPayload extends JwtPayload {
	userId: string;
}

const authHandler = (req: Request, res: Response, next: NextFunction) => {
	try {
		// get the token from headers
		const authHeader = req.headers["authorization"];

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			logger.error("Auth handler -> failure", {
				error: "Access denied: Invalid token has been provided",
			});

			throw new UnauthorizedError(
				"Access denied: Invalid token has been provided",
			);
		}

		// verify the token
		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(
			token,
			serverConfig.ACCESS_SECRET_KEY,
		) as DecodedJwtPayload;

		// attach the user id to req. and then call the next middlewares
		req.userId = decoded.userId;
		next();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			throw error;
		} else {
			logger.error("Auth handler -> failure", {
				error: "Access denied: Invalid token has been provided",
			});

			throw new ForbiddenError(
				"Access denied: Invalid token has been provided",
			);
		}
	}
};

export { authHandler };
