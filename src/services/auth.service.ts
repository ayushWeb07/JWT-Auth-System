import * as authRepository from "../repositories/auth.repository.ts";
import type { RegisterUserDTO } from "../dtos/auth.dto.ts";

const registerUser = async (payload: RegisterUserDTO) => {
	// register the user and generarte the token
	const token= await authRepository.registerUser(payload);
    return token;
};

export { registerUser };
