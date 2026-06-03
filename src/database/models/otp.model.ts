import mongoose from "mongoose";

// create the otp schema
const otpSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
		},

		userEmail: {
			type: String,
			required: [true, "User email is required"],
		},

		hashedOtp: {
			type: String,
			required: [true, "Hashed otp is required"],
		},
	},
	{
		timestamps: true,
	},
);

// create the otps model
const otpModel = mongoose.model("otps", otpSchema);

export { otpModel };
