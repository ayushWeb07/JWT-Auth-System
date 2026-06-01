import z from "zod";

const getOneSchema = z.object({
	username: z.string().min(6).max(20),
	email: z.string().min(6).max(20),
});

export { getOneSchema };
