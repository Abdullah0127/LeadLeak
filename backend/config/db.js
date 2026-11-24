import mongoose from "mongoose";
import dns from "node:dns";

// Use reliable public DNS servers for MongoDB SRV lookups
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    // console.log(`MongoDB Connected: ${connection.connection.host}`);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    console.log(`MongoDB Database: ${connection.connection.name}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
