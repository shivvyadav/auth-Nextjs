import connectDB from "@/config/db";
import User from "@/model/user.mode";
import bcrypt from "bcryptjs";
import {NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const {name, email, password} = await request.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", {status: 400});
    }

    const existingUser = await User.findOne({email});
    if (existingUser) {
      return new NextResponse("User already exists", {status: 409});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({name, email, password: hashedPassword});
    return new NextResponse(JSON.stringify(user), {status: 200});
  } catch (error) {
    console.log(error);
    return new NextResponse("Database Error", {status: 500});
  }
}
