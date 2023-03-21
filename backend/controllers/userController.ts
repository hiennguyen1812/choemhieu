import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User, { IUserRequest } from "../models/User";
import generateToken from "../utils/generateToken";
import jwt from "jsonwebtoken";
// @Desc Register user
// @Route /api/users/register
// @Method POST
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, avatar } = req.body;

  const user = new User({
    name,
    email,
    password,
    avatar,
  });

  await user.save();

  // res.status(201).json({
  //   id: user._id,
  //   name: user.name,
  //   email: user.email,
  //   avatar: user.avatar,
  //   isAdmin: user.isAdmin,
  //   token: generateToken(user._id)
  // });
  res.status(201).json({ user });
});

// @Desc Login user
// @Route /api/users/login
// @Method POST
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  if (await user.comparePassword(password)) {
    const refresh_token = await user.getRefreshToken();
    const access_token = await user.getAccessToken();
    user.refreshToken = refresh_token;
    await user.save();
    res.cookie("token", refresh_token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      access_token,
    });
  } else {
    res.status(401);
    throw new Error("Email or password incorrect");
  }
});

export const getRefreshToken = asyncHandler(async (req: any, res: any) => {
  const cookies = req.cookies;

  if (!cookies?.token as unknown as string)
    return res.status(401).json({ message: "Unauthorized" });
  const user = await User.find();
  const data = user.find((item) => item.refreshToken === cookies.token);
  if (!data) {
    return res.status(403).json({ message: "Forbidden" });
  }
  jwt.verify(
    cookies.token,
    'xGJ*ernUb!Y*u^m2m!2G4*AED)(qG$tC8KdHKTNzY4gtn&y7gm',
    async (err: any, decoded: any) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      if (decoded) {
        const access_token = await data.getAccessToken();
        res.json({ access_token });
      }
    }
  );
  // const decoded = jwt.verify(
  //   cookies.token,
  //   process.env.REFRESH_TOKEN_SECRET as string
  // );
  // console.log(decoded);

  // if (decoded) {
  //   const access_token = await data.getAccessToken();
  //   res.status(200).json({ access_token });
  // }
});

// @Desc Update profile
// @Route /api/users/update
// @Method PUT
export const updateProfile = asyncHandler(
  async (req: IUserRequest, res: Response) => {
    let user = await User.findById(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const { name, email, avatar } = req.body;

    user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        email,
        avatar,
      },
      { new: true }
    ).select("-password");

    res.status(201).json({
      id: user?._id,
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
      isAdmin: user?.isAdmin,
      token: generateToken(user?._id),
    });
  }
);

// @Desc Update password
// @Route /api/users/update/password
// @Method PUT
export const updatePassword = asyncHandler(
  async (req: IUserRequest, res: Response) => {
    let user = await User.findById(req.user.id);

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    const { oldPassword, newPassword } = req.body;

    if (await user.comparePassword(oldPassword)) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);

      user = await User.findByIdAndUpdate(
        req.user.id,
        {
          password: hash,
        },
        { new: true }
      );

      res.status(201).json({
        id: user?._id,
        name: user?.name,
        email: user?.email,
        avatar: user?.avatar,
        isAdmin: user?.isAdmin,
        token: generateToken(user?._id),
      });
    } else {
      res.status(401);
      throw new Error("Old password incorrect");
    }
  }
);

// @Desc Get all users
// @Route /api/users
// @Method GET
export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const pageSize = 4;
  const page = Number(req.query.pageNumber) || 1;
  const count = await User.countDocuments();
  const users = await User.find({})
    .select("-password")
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.status(201).json({
    users,
    page,
    pages: Math.ceil(count / pageSize),
    count,
  });
});

// @Desc Get single user by ID
// @Route /api/users/:id
// @Method GET
export const getSingleUser = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await User.findById(req.params.id).select("_id name email isAdmin");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }

    res.status(201).json(user);
  }
);

// @Desc Update user by ID
// @Route /api/users/:id
// @Method PUT
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  }).select("-password");

  res.status(201).json(user);
});

// @Desc Delete user by ID
// @Route /api/users/:id
// @Method DELETE
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(201).json({});
});
