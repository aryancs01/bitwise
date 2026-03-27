import mongoose from "mongoose";
import { env } from "./env";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("mongoose connected")

    mongoose.connection.on("error", (error) => {
      console.log("mongoose connection error ", error)
    })

    mongoose.connection.on("disconnected", () => {
      console.log("mongoose disconnected")
    })

    process.on("SIGINT", async ()=>{
      await mongoose.connection.close()
      console.log("mongoose connection closed")
      process.exit(0)
    })
  } catch (error: any) {
    console.log("Failed to connect database", error)
    process.exit(1);
  }
};