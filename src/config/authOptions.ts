import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import User from "@/model/user.mode";
import bcrypt from "bcryptjs";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "text", placeholder: "username"},
        password: {label: "Password", type: "password"},
      },
      async authorize(credentials, req) {
        const {email, password} = credentials as {email: string; password: string};
        if (!email || !password) {
          throw new Error("Missing email or password");
        }
        await connectDB();
        const user = await User.findOne({email});
        if (!user) {
          throw new Error("User not found");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        return {
          id: user._id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({account, user}) {
      if (account?.provider === "google") {
        await connectDB();
        let newUser = await User.findOne({email: user.email});
        if (!newUser) {
          newUser = await User.create({
            name: user.name,
            email: user.email,
          });
        }
        user.id = newUser._id;
      }
      return true;
    },
    async jwt({token, user}) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({session, token}) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.image as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
  pages: {
    signIn: "/api/auth/login",
    error: "/api/auth/login",
  },
  secret: process.env.NEXT_AUTH_SECRET,
};
export default authOptions;
