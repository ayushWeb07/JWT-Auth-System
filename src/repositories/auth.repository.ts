import type { LoginUserDTO, RegisterUserDTO } from "../dtos/auth.dto.ts";
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

		// save the refresh token in db
		newUser.refreshToken = refreshToken;
		await newUser.save();

		logger.info("Auth: registerUser endpoint -> success", {
			userId: newUser._id,
		});

		return {
			accessToken,
			refreshToken,
		};
	} catch (error) {
		if (error instanceof BadRequestError) {
			throw error;
		} else {
			logger.error("Auth: registerUser endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while registering",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

const loginUser = async (payload: LoginUserDTO) => {
	try {
		// fetch the user
		const user = await userModel.findOne({
			$and: [
				{
					username: payload.username,
				},
				{
					email: payload.email,
				},
			],
		});

		if (!user) {
			logger.error("Users: loginUser endpoint -> failure", {
				error: "User doesn't exist",
				username: payload.username,
				email: payload.email,
			});

			throw new BadRequestError(
				"User with that username and email, doesn't exist",
			);
		}

		// verify the password
		const orgPassword = CryptoJS.AES.decrypt(
			user.password,
			serverConfig.CRYPTO_SECRET_KEY,
		).toString(CryptoJS.enc.Utf8);

		if (orgPassword != payload.password) {
			logger.error("Users: loginUser endpoint -> failure", {
				error: "Incorrect password has been provided",
				username: payload.username,
				email: payload.email,
			});

			throw new BadRequestError("Incorrect password has been provided");
		}

		// generate the new tokens
		const accessToken = jwt.sign(
			{
				userId: user._id,
			},
			serverConfig.ACCESS_SECRET_KEY,
			{
				expiresIn: "15m",
			},
		);

		const refreshToken = jwt.sign(
			{
				userId: user._id,
			},
			serverConfig.REFRESH_SECRET_KEY,
			{
				expiresIn: "7d",
			},
		);

		// update the refresh token in db
		user.refreshToken = refreshToken;
		await user.save();

		logger.info("Auth: loginUser endpoint -> success", {
			userId: user._id,
		});

		return {
			accessToken,
			refreshToken,
		};
	} catch (error) {
		if (error instanceof BadRequestError) {
			throw error;
		} else {
			logger.error("Auth: loginUser endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while logging",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

export { registerUser, loginUser };
