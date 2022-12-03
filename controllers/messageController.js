import { ErrorHandler } from "../utils/ErrorHandler.js";
import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

const sendMessage = asyncHandler(async (req, res, next) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    return next(
      new ErrorHandler("Request Body is Invalid because It is Empty..", 400)
    );
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// get all messages

const allMessages = asyncHandler(async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export { sendMessage, allMessages };
