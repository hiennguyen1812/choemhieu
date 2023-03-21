import { Request } from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUserRequest extends Request {
  user?: any;
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  isAdmin: boolean;
  token?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(entredPassword: string): Promise<Boolean>;
  getAccessToken(): Promise<string>;
  getRefreshToken(): Promise<string>;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
    refreshToken: String,
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUser;

  if (!user.isModified("password")) return next();

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(user.password, salt);

  user.password = hash;

  next();
});

UserSchema.methods.comparePassword = function (entredPassword: string) {
  const user = this as IUser;
  return bcrypt.compareSync(entredPassword, user.password);
};

UserSchema.methods.getAccessToken = function () {
  const user = this as IUser;
  return jwt.sign({ id: user._id }, 'h*L8%5J)JH)fFJXKW29(JaU!K*E8w#YagCs7&BZ6KCbJmprqCf', {
    expiresIn: "1d",
  });
};

UserSchema.methods.getRefreshToken = function () {
  const user = this as IUser;
  return jwt.sign(
    {
      UserInfor: {
        name: user.name,
        email: user.email,
      },
    },
    'xGJ*ernUb!Y*u^m2m!2G4*AED)(qG$tC8KdHKTNzY4gtn&y7gm',
    {
      expiresIn: "7d",
    }
  );
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
