import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/app.error.ts";

const errorHandler = (
	error: AppError,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const errorObj = {
		success: false,
		message: error.message ?? "Internal Server Error",
		name: error.name,
		stackTrace: error?.stack ?? "No stack trace present",
	};

	// send out the response
	res.status(error.statusCode ?? 500).json(errorObj);
};

export { errorHandler };
