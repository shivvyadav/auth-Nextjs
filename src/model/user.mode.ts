import mongoose, {Schema, Document} from "mongoose";

interface IUser extends Document {
  image?: string;
  name: string;
  email: string;
  password?: string;
}

const userSchema = new Schema<IUser>(
  {
    image: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
  },

  {timestamps: true}
);

const User = mongoose.models?.User || mongoose.model<IUser>("User", userSchema);

export default User;
