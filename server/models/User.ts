import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true },
  picture: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", userSchema); 