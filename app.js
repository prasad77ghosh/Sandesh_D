import express from "express";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/err.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

// middlewares for error
app.use(errorMiddleware);
export { app };
