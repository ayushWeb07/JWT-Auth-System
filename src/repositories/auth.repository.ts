import type { RegisterUserDTO } from "../dtos/auth.dto.ts";
import { userModel } from "../database/models/user.model.ts";
import { logger } from "../config/logger.config.ts";
import {
	BadRequestError,
	InternalServerError,
} from "../utils/errors/app.error.ts";
import CryptoJS from "crypto-js";
import { serverConfig } from "../config/index.ts";
import jwt from "jsonwebtoken";

const registerUser = async (payload: RegisterUserDTO) => {
	try {
		// fetch the user
		const existingUser = await userModel.findOne({
			$or: [
				{
					username: payload.username,
				},
				{
					email: payload.email,
				},
			],
		});

		if (existingUser) {
			logger.error("Users: registerUser endpoint -> failure", {
				error: "User already exists",
				username: payload.username,
				email: payload.email,
			});

			throw new BadRequestError(
				"User with that username or email, already exists",
			);
		}

		// hash the password
		const hashedPassword = CryptoJS.AES.encrypt(
			payload.password,
			serverConfig.CRYPTO_SECRET_KEY,
		).toString();

		// insert the user
		const newUser = await userModel.create({
			username: payload.username,
			email: payload.email,
			password: hashedPassword,
		});

		// generate the tokens
		const accessToken = jwt.sign(
			{
				userId: newUser._id,
			},
			serverConfig.ACCESS_SECRET_KEY,
			{
				expiresIn: "15m",
			},
		);

		const refreshToken = jwt.sign(
			{
				userId: newUser._id,
			},
			serverConfig.REFRESH_SECRET_KEY,
			{
				expiresIn: "7d",
			},
		);

		// update the refresh token in db
		newUser.refreshToken= refreshToken
		await newUser.save()

		logger.info("Auth: registerUser endpoint -> success", {
			userId: newUser._id,
		});

		return accessToken;
	} catch (error) {
		if (error instanceof BadRequestError) {
			throw error;
		} else {
			logger.error("Auth: registerUser endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while creating a new user",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

export { registerUser };
