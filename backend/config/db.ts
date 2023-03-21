import mongoose from "mongoose";
import { ConnectionOptions } from "tls";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/booking", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectionOptions);
    console.log("Database is connected");
  } catch (error: any) {
    console.log(error.message);
  }
};

export default connectDB;
