import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "../services/auth.service.ts";

const registerUser = async (req: Request, res: Response) => {
	const token = await authService.registerUser(req.body);

	res.status(StatusCodes.CREATED).json({
		success: true,
		message: "User has been successfully registered",
		token,
	});
};

const loginUser = async (req: Request, res: Response) => {
	const token = await authService.loginUser(req.body);

	res.status(StatusCodes.OK).json({
		success: true,
		message: "User has been successfully logged in",
		token,
	});
};

export { registerUser, loginUser };
