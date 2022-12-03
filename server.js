import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import { Server } from "socket.io";
import path from "path";
import express from "express";

//handling uncought expection
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error.message}`);
  console.log("Shutting down the server due to uncought exception");
  process.exit(1);
});

//config
dotenv.config({ path: "config/config.env" });

connectDB();
const server = app.listen(process.env.PORT, () => {
  console.log(`Listaning on port ${process.env.PORT}`);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONT_URL,
  },
});

io.on("connection", (socket) => {
  console.log("Connected To socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log("User Joined room" + room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop_typing", (room) => {
    socket.in(room).emit("stop_typing");
  });

  socket.on("new_message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;
    if (!chat.users) {
      return console.log("chat.users is not defiend");
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message_received", newMessageReceived);
    });
  });

 

  socket.off("setup", () => {
    console.log("User Disconnected");
    socket.leave(userData._id);
  });
});

 // ------------------------------ Deployment Code --------------------------//
  const __dirname1 = path.resolve();
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "./client/build")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"));
    });
  } else {
    app.get("/", (req, res) => {
      res.send("API is Running Successfully..");
    });
  }

  // ------------------------------ Deployment Code --------------------------//

// unHandled promise rejection
process.on("uncaughtException", (error) => {
  console.log(`Error: ${error}`);
  console.log("Shutting down the server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
