import { Request } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

export interface IUserRequest extends Request {
    user?: any
}

export interface IUser extends mongoose.Document {

    name: string,
    email: string,
    password: string,
    avatar?: string,
    isAdmin: boolean,
    token?: string,
    refreshToken?: string,
    createdAt: Date,
    updatedAt: Date,
    comparePassword(entredPassword: string): Promise<Boolean>,
    getAccessToken(): Promise<string>,
    getRefreshToken(): Promise<string>
}

const UserSchema = new mongoose.Schema({

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
    refreshToken: String

}, {
    timestamps: true
});

UserSchema.pre("save", async function (next) {

    const user = this as IUser;

    if (!user.isModified("password")) return next();

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);

    user.password = hash;

    next();

})

UserSchema.methods.comparePassword = function (entredPassword: string) {
    const user = this as IUser;
    return bcrypt.compareSync(entredPassword, user.password);
}

UserSchema.methods.getAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET as string, {
        expiresIn: "1d",
    });
};

UserSchema.methods.getRefreshToken = function () {
    return jwt.sign(
        {
            UserInfor: {
                username: this.username,
                email: this.email,
            },
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: "7d",
        }
    );
};


const User = mongoose.model<IUser>("User", UserSchema);

export default User;