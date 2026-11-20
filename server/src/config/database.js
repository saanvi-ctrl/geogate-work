import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Create server/.env using server/.env.example and add your MongoDB connection string.");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
