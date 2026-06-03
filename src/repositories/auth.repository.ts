import type {
	LoginUserDTO,
	RegisterUserDTO,
	RefreshAccessTokenDTO,
	LogoutUserDTO,
	LogoutUserFromAllSessionsDTO, SendOtpForVerificationDTO,
} from "../dtos/auth.dto.ts";
import { userModel } from "../database/models/user.model.ts";
import { logger } from "../config/logger.config.ts";
import {
	BadRequestError,
	ForbiddenError,
	InternalServerError,
	UnauthorizedError,
} from "../utils/errors/app.error.ts";
import CryptoJS from "crypto-js";
import { serverConfig } from "../config/index.ts";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { sessionModel } from "../database/models/session.model.ts";
import {otpModel} from "../database/models/otp.model.ts";
import otpGenerator from "otp-generator"
import {sendEmail} from "../services/mail.service.ts";

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
		// const accessToken = jwt.sign(
		// 	{
		// 		userId: newUser._id,
		// 	},
		// 	serverConfig.ACCESS_SECRET_KEY,
		// 	{
		// 		expiresIn: "15m",
		// 	},
		// );

		// const refreshToken = jwt.sign(
		// 	{
		// 		userId: newUser._id,
		// 	},
		// 	serverConfig.REFRESH_SECRET_KEY,
		// 	{
		// 		expiresIn: "7d",
		// 	},
		// );

		// generate the session
		// const hashedRefreshToken = CryptoJS.SHA256(refreshToken).toString();

		// const newSession = await sessionModel.create({
		// 	userId: newUser._id,
		// 	hashedRefreshToken,
		// });

		logger.info("Auth: registerUser endpoint -> success", {
			userId: newUser._id,
		});

		return newUser;
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

		// check if user is verified
		if (!user.verified) {
			logger.error("Auth: loginUser endpoint -> failure", {
				error: "User is not verified",
				username: payload.username,
				email: payload.email,
			});

			throw new ForbiddenError(
				"User with that username and email, is not verified",
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
		if (error instanceof BadRequestError || error instanceof ForbiddenError) {
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

		// check if user is verified
		if (!user.verified) {
			logger.error("Auth: refreshAccessToken endpoint -> failure", {
				error: "User is not verified",
				username: user.username,
				email: user.email,
			});

			throw new ForbiddenError(
				"User with that username and email, is not verified",
			);
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
			error instanceof BadRequestError ||
			error instanceof ForbiddenError
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

		// fetch the user
		const user = await userModel.findById(decoded.userId);

		if (!user) {
			logger.error("Auth: logoutUser endpoint -> failure", {
				error: "User doesn't exist",
				id: decoded.userId,
			});

			throw new BadRequestError("User with that refresh token, doesn't exist");
		}

		// check if user is verified
		if (!user.verified) {
			logger.error("Auth: logoutUser endpoint -> failure", {
				error: "User is not verified",
				username: user.username,
				email: user.email,
			});

			throw new ForbiddenError(
				"User with that username and email, is not verified",
			);
		}

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
			error instanceof BadRequestError ||
			error instanceof ForbiddenError
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

const logoutUserFromAllSessions = async (
	payload: LogoutUserFromAllSessionsDTO,
) => {
	try {
		if (!payload.token) {
			logger.error("Auth: logoutUserFromAllSessions endpoint -> failure", {
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
			logger.error("Auth: logoutUserFromAllSessions endpoint -> failure", {
				error: "User doesn't exist",
				id: decoded.userId,
			});

			throw new BadRequestError("User with that refresh token, doesn't exist");
		}

		// check if user is verified
		if (!user.verified) {
			logger.error("Auth: logoutUserFromAllSessions endpoint -> failure", {
				error: "User is not verified",
				username: user.username,
				email: user.email,
			});

			throw new ForbiddenError(
				"User with that username and email, is not verified",
			);
		}

		// find all the relevant sessions session and revoke them
		await sessionModel.updateMany(
			{
				revoked: false,
				userId: decoded.userId,
			},
			{
				$set: {
					revoked: true,
				},
			},
		);

		logger.info("Auth: logoutUserFromAllSessions endpoint -> success");
	} catch (error) {
		if (error instanceof UnauthorizedError ||
			error instanceof BadRequestError ||
			error instanceof ForbiddenError) {
			throw error;
		} else {
			logger.error(
				"Auth: logoutUserFromAllSessions endpoint -> failure",
				error,
			);

			throw new InternalServerError(
				"Something went wrong while logging out from all the sessions",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

const sendOtpForVerification = async (payload: SendOtpForVerificationDTO) => {
	try {
		// fetch the user
		const user = await userModel.findOne({
			email: payload.email,
		});

		if (!user) {
			logger.error("Auth: sendOtpForVerification endpoint -> failure", {
				error: "User doesn't exist",
				email: payload.email,
			});

			throw new BadRequestError(
				"User with that email, doesn't exist",
			);
		}

		// check if user is already verified
		if (user.verified) {
			logger.error("Auth: sendOtpForVerification endpoint -> failure", {
				error: "User is already verified",
				email: payload.email,
			});

			throw new ForbiddenError(
				"User with that email, is already verified",
			);
		}

		// generate and hash the otp
		const otp= otpGenerator.generate(10);
		const hashedOtp = CryptoJS.SHA256(otp).toString();

		// insert the otp into the db
		await otpModel.insertOne({
			userId: user._id,
			userEmail: user.email,
			hashedOtp
		})

		// send the otp verification mail
		await sendEmail({
			toMailAddress: user.email,
			subject: "Complete Your Account Verification",
			templateId: "otp-verification",
			params: {
				user_name: user.username,
				app_name: "Acme Corp",
				otp,
			},
		})

		logger.info("Auth: sendOtpForVerification endpoint -> success", {
			userId: user._id,
		});
	} catch (error) {
		if (error instanceof BadRequestError || error instanceof ForbiddenError) {
			throw error;
		} else {
			logger.error("Auth: sendOtpForVerification endpoint -> failure", error);

			throw new InternalServerError(
				"Something went wrong while sending otp for account verification",
				error instanceof Error ? error.stack : undefined,
			);
		}
	}
};

export {
	registerUser,
	loginUser,
	refreshAccessToken,
	logoutUser,
	logoutUserFromAllSessions,
	sendOtpForVerification
};
