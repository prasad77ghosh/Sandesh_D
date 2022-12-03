import jwt from "jsonwebtoken";
import {ErrorHandler} from "../utils/ErrorHandler.js";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const isAuthUser = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("Plaese login to access this resource", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);
  next();
});

export { isAuthUser };
