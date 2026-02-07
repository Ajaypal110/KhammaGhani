import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
  type: String,
  required: true,
  unique: true,   // 🔥 MUST
  lowercase: true,
  trim: true,
},


    password: {
      type: String,
      select: true, // 🔥 IMPORTANT
    },

    phone: String,

    provider: {
      type: String,
      default: "password",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
