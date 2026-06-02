import mongoose from "mongoose";

// create the session schema
const sessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users"
		},

		hashedRefreshToken: {
			type: String,
			required: [true, "Hashed refresh token is required"],
		},

		revoked: {
			type: Boolean,
			default: false
		},
	},
	{
		timestamps: true,
	},
);

// create the sessions model
const sessionModel = mongoose.model("sessions", sessionSchema);

export { sessionModel };
