import z from "zod";

const registerSchema = z.object({
	username: z.string().min(6).max(20),
	email: z.string().min(6).max(20),
	password: z.string().min(8).max(20),
});

const loginSchema = z.object({
	username: z.string().min(6).max(20),
	email: z.string().min(6).max(20),
	password: z.string().min(8).max(20),
});

export { registerSchema, loginSchema };
