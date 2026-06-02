import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as usersService from "../services/users.service.ts";

const getCurrentUser = async (req: Request, res: Response) => {
	const user = await usersService.getCurrentUser({
		userId: req.userId,
	});

	res.status(StatusCodes.OK).json({
		success: true,
		message: "Current user has been successfully fetched",
		user,
	});
};

export { getCurrentUser };
