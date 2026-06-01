import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const registerUser = async (req: Request, res: Response) => {
	res.status(StatusCodes.NOT_IMPLEMENTED).json({
		message: "Creation of user is pending",
		success: true,
	});
};

export { registerUser };
