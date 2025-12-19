
import {connect} from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
    console.log("Using existing database connection");
  }

  if (!cached.promise) {
    cached.promise = connect(MONGODB_URI).then((c) => c.connection);
  }

  try {
    cached.conn = await cached.promise;
    console.log("Using new database connection");
  } catch (error) {
    throw error;
  }
  return cached.conn;
};
export default connectDB;
