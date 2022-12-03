import { ErrorHandler } from "../utils/ErrorHandler.js";
import User from "../models/userModel.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import asyncHandler from "express-async-handler";

//register User
const RegisterUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    return next(new ErrorHandler("All fileds are required", 400));
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorHandler("User already exists", 400));
  }
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  sendToken(user, 201, res);
});

//login user
const LoginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new ErrorHandler("Please enter a valid email and password", 400)
    );
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email and password", 401));
  }

  sendToken(user, 200, res);
});

//logout user
const logOutUser = asyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully..",
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.getPasswordResetToken();
  // this methods created after creating user so we have to save user to store resetPasswordToken and resetPasswordExpire indide uuserSchma
  await user.save({ validateBeforeSave: false });
  // const resetPasswordUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/user/password/reset/${resetToken}`;
  const resetPasswordUrl = `${process.env.FRONT_URL}/reset/password/${resetToken}`;
  const message = `Your reset password Token is :- \n\n ${resetPasswordUrl} \n\n if you have not request this email then please ignore it`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Sandesh App Password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email send ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset Password

const resetPassword = asyncHandler(async (req, res, next) => {
  // creating resetPassworToken to match resetPasswordToken present inside database

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // should be
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset password token is Invald or hasbeen expired", 400)
    );
  }

  // if (req.body.password !== req.body.confirmPassword) {
  //   return next(new ErrorHandler("Password does not matched", 400));
  // }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

const getAllUsers = asyncHandler(async (req, res, next) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
});

export { RegisterUser, LoginUser, logOutUser, forgotPassword, resetPassword, getAllUsers };
