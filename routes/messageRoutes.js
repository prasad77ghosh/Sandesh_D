import express from "express";
import { isAuthUser } from "../middlewares/AuthMiddleware.js";
import { sendMessage, allMessages } from "../controllers/messageController.js";

const router = express.Router();

router.route("/").post(isAuthUser, sendMessage);
router.route("/:chatId").get(isAuthUser, allMessages);

export default router;
