import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "../services/auth.service.ts";

const registerUser = async (req: Request, res: Response) => {
	const result = await authService.registerUser(req.body);

	// store the refresh token in cookie
	res.cookie("token", result.refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.status(StatusCodes.CREATED).json({
		success: true,
		message: "User has been successfully registered",
		token: result.accessToken,
	});
};

const loginUser = async (req: Request, res: Response) => {
	const result = await authService.loginUser(req.body);

	// store the refresh token in cookie
	res.cookie("token", result.refreshToken, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.status(StatusCodes.OK).json({
		success: true,
		message: "User has been successfully logged in",
		token: result.accessToken,
	});
};

export { registerUser, loginUser };
