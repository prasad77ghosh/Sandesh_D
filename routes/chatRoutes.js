import express from "express";
import { isAuthUser } from "../middlewares/AuthMiddleware.js";
import {
  accessChat,
  allChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chatControllers.js";

const router = express.Router();

router.route("/").post(isAuthUser, accessChat);
router.route("/").get(isAuthUser, allChats);
router.route("/group").post(isAuthUser, createGroupChat);
router.route("/rename").put(isAuthUser, renameGroup);
router.route("/groupRemove").put(isAuthUser, removeFromGroup);
router.route("/groupAdd").put(isAuthUser, addToGroup);

export default router;
