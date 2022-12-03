import mongoose from "mongoose";
import validator from "validator";
import Bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      required: [true, "Please Enter Your Name"],
      maxLength: [30, "Name can't exceed more than 30 characters"],
      minLength: [4, "Name should have more than 4 characters"],
    },
    email: {
      type: "String",
      required: [true, "Please Enter Your Email"],
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: "String",
      required: [true, "Please enter your password"],
      validate: [
        validator.isStrongPassword,
        "Please enter a strong password it must contains atleast 8-char,1-symbol,1-number,1-uppercase",
      ],
      select: false,
    },
    pic: {
      type: "String",
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },

  { timestaps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  // const salt = await Bcrypt.genSalt(10);
  // this.password = await Bcrypt.hash(this.password, salt);
  this.password = await Bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await Bcrypt.compare(enteredPassword, this.password);
};

//generating password reset token
userSchema.methods.getPasswordResetToken = function () {
  // generate <token></token>
  const resetToken = crypto.randomBytes(20).toString("hex");
  //hashing and adding to  user schma
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
export default User;
