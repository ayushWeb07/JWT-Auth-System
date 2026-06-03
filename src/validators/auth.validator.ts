import z from "zod";

const registerSchema = z.object({
	username: z.string().min(6).max(50),
	email: z.string().min(6).max(50),
	password: z.string().min(8).max(50),
});

const loginSchema = z.object({
	username: z.string().min(6).max(50),
	email: z.string().min(6).max(50),
	password: z.string().min(8).max(50),
});

const sendOtpForVerificationSchema = z.object({
	email: z.string().min(6).max(50),
});

const verifyOtpSchema = z.object({
	email: z.string().min(6).max(50),
	otp: z.string().length(10),
});

export {
	registerSchema,
	loginSchema,
	sendOtpForVerificationSchema,
	verifyOtpSchema,
};
