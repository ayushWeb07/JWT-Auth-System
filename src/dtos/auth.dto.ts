export interface RegisterUserDTO {
	username: string;
	email: string;
	password: string;
}

export interface LoginUserDTO {
	username: string;
	email: string;
	password: string;
}

export interface RefreshAccessTokenDTO {
	token: string | undefined;
}
