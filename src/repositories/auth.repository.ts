import type {
	LoginUserDTO,
	RegisterUserDTO,
	RefreshAccessTokenDTO,
	LogoutUserDTO,
} from "../dtos/auth.dto.ts";
import { userModel } from "../database/models/user.model.ts";
import { logger } from "../config/logger.config.ts";
import {
	BadRequestError,
	InternalServerError,
	UnauthorizedError,
} from "../utils/errors/app.error.ts";
import CryptoJS from "crypto-js";
import { serverConfig } from "../config/index.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sessionModel } from "../database/models/session.model.ts";

interface DecodedJwtPayload extends JwtPayload {
	userId: string;
}

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
			logger.error("Auth: registerUser endpoint -> failure", {
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

		// generate the session
		const hashedRefreshToken = CryptoJS.SHA256(refreshToken).toString();

		const newSession = await sessionModel.create({
			userId: newUser._id,
			hashedRefreshToken,
		});

		logger.info("Auth: registerUser endpoint -> success", {
			userId: newUser._id,
			sessionId: newSession._id,
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
			logger.error("Auth: loginUser endpoint -> failure", {
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
			logger.error("Auth: loginUser endpoint -> failure", {
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

		// generate the session
		const hashedRefreshToken = CryptoJS.SHA256(refreshToken).toString();

		const newSession = await sessionModel.create({
			userId: user._id,
			hashedRefreshToken,
		});

		logger.info("Auth: loginUser endpoint -> success", {
			userId: user._id,
			sessionId: newSession._id,
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

const refreshAccessToken = async (payload: RefreshAccessTokenDTO) => {
	try {
		if (!payload.token) {
			logger.error("Auth: refreshAccessToken endpoint -> failure", {
				error: "Access denied: Please login again as the tokens are missing",
			});

			throw new UnauthorizedError(
				"Access denied: Please login again as the tokens are missing",
			);
		}

		// verify the refresh token
		const decoded = jwt.verify(
			payload.token,
			serverConfig.REFRESH_SECRET_KEY,
		) as DecodedJwtPayload;

		// fetch the user
		const user = await userModel.findById(decoded.userId);

		if (!user) {
			logger.error("Auth: refreshAccessToken endpoint -> failure", {
				error: "User doesn't exist",
				id: decoded.userId,
			});

			throw new BadRequestError("User with that refresh token, doesn't exist");
		}

		// fetch the session
		const hashedRefreshToken = CryptoJS.SHA256(payload.token).toString();

		const session = await sessionModel.findOne({
			hashedRefreshToken,
			revoked: false,
			userId: decoded.userId,
		});

		if (!session) {
			logger.error("Auth: refreshAccessToken endpoint -> failure", {
				error: "Such session doesn't exist",
			});

			throw new BadRequestError(
				"Session with that refresh token doesn't exist",
			);
		}

		// generate the new access token
		const accessToken = jwt.sign(
			{
				userId: user._id,
			},
			serverConfig.ACCESS_SECRET_KEY,
			{
				expiresIn: "15m",
			},
		);

		logger.info("Auth: refreshAccessToken endpoint -> success", {
			userId: user._id,
		});

		return accessToken;
	} catch (error) {
		if (
			error instanceof UnauthorizedError ||
			error instanceof BadRequestError
		) {
			throw error;
		} else {
			logger.error("Auth: refreshAccessToken endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while refreshing the token",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

const logoutUser = async (payload: LogoutUserDTO) => {
	try {
		if (!payload.token) {
			logger.error("Auth: logoutUser endpoint -> failure", {
				error: "Access denied: Please login again as the tokens are missing",
			});

			throw new UnauthorizedError(
				"Access denied: Please login again as the tokens are missing",
			);
		}

		// verify the refresh token
		const decoded = jwt.verify(
			payload.token,
			serverConfig.REFRESH_SECRET_KEY,
		) as DecodedJwtPayload;

		// find the session
		const hashedRefreshToken = CryptoJS.SHA256(payload.token).toString();

		const session = await sessionModel.findOne({
			hashedRefreshToken,
			revoked: false,
			userId: decoded.userId,
		});

		if (!session) {
			logger.error("Auth: logoutUser endpoint -> failure", {
				error: "Such session doesn't exist",
			});

			throw new BadRequestError(
				"Session with that refresh token doesn't exist",
			);
		}

		// revoke the session and clear cookie
		session.revoked = true;
		await session.save();

		logger.info("Auth: logoutUser endpoint -> success", {
			sessionId: session._id,
		});
	} catch (error) {
		if (
			error instanceof UnauthorizedError ||
			error instanceof BadRequestError
		) {
			throw error;
		} else {
			logger.error("Auth: logoutUser endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while logging out",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

export { registerUser, loginUser, refreshAccessToken, logoutUser };
