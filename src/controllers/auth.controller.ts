import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "../services/auth.service.ts";

const registerUser = async (req: Request, res: Response) => {
	const user = await authService.registerUser(req.body);

	// store the refresh token in cookie
	// res.cookie("token", result.refreshToken, {
	// 	httpOnly: true,
	// 	secure: true,
	// 	sameSite: "strict",
	// 	maxAge: 7 * 24 * 60 * 60 * 1000,
	// });

	res.status(StatusCodes.CREATED).json({
		success: true,
		message: "User has been successfully registered",
		user: {
			username: user.username,
			email: user.email,
		},
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

const refreshAccessToken = async (req: Request, res: Response) => {
	const refreshToken: string | undefined = req.cookies.token;

	const newAccessToken = await authService.refreshAccessToken({
		token: refreshToken,
	});

	res.status(StatusCodes.OK).json({
		success: true,
		message: "Tokens have been successfully refreshed",
		token: newAccessToken,
	});
};

const logoutUser = async (req: Request, res: Response) => {
	const refreshToken: string | undefined = req.cookies.token;

	await authService.logoutUser({
		token: refreshToken,
	});

	// clear the cookies to remove the refresh token
	res.clearCookie("token");

	res.status(StatusCodes.OK).json({
		success: true,
		message: "User has been successfully logged out",
	});
};

const logoutUserFromAllSessions = async (req: Request, res: Response) => {
	const refreshToken: string | undefined = req.cookies.token;

	await authService.logoutUserFromAllSessions({
		token: refreshToken,
	});

	// clear the cookies to remove the refresh token
	res.clearCookie("token");

	res.status(StatusCodes.OK).json({
		success: true,
		message: "User has been successfully logged out from all the sessions",
	});
};

const sendOtpForVerification = async (req: Request, res: Response) => {
	await authService.sendOtpForVerification(req.body);

	res.status(StatusCodes.OK).json({
		success: true,
		message: "OTP has been successfully sent for verification",
	});
};

const verifyOtp = async (req: Request, res: Response) => {
	await authService.verifyOtp(req.body);

	res.status(StatusCodes.OK).json({
		success: true,
		message: "Your account has been successfully verified. Please login again",
	});
};

export {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	logoutUserFromAllSessions,
	sendOtpForVerification,
	verifyOtp,
};
