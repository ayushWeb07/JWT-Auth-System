import * as authRepository from "../repositories/auth.repository.ts";
import type {
	LoginUserDTO,
	LogoutUserDTO,
	RefreshAccessTokenDTO,
	RegisterUserDTO,
} from "../dtos/auth.dto.ts";

interface AuthUserResult {
	accessToken: string;
	refreshToken: string;
}

const registerUser = async (payload: RegisterUserDTO) => {
	// register the user and generate the token
	const result = (await authRepository.registerUser(payload)) as AuthUserResult;
	return result;
};

const loginUser = async (payload: LoginUserDTO) => {
	// login the user and generate the token
	const result = (await authRepository.loginUser(payload)) as AuthUserResult;
	return result;
};

const refreshAccessToken = async (payload: RefreshAccessTokenDTO) => {
	// generate new access token using the refresh token
	const token = await authRepository.refreshAccessToken(payload);
	return token;
};

const logoutUser = async (payload: LogoutUserDTO) => {
	// logout the user
	await authRepository.logoutUser(payload);
};

export { registerUser, loginUser, refreshAccessToken, logoutUser };
