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

export { registerUser };
