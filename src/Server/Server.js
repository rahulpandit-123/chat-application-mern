import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./Models/User.js";
import Message from "./Models/Message.js";
import multer from "multer";
import cloudinary from "./Config/Cloudinary.js";

// =======================
// Environment Variables
// =======================

dotenv.config();

// =======================
// MongoDB Connection
// =======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.log("MongoDB error:", error);
  });

// =======================
// Express Setup
// =======================

const app = express();

const server = http.createServer(app);

app.use(express.json());

// =======================
// CORS
// =======================

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

// =======================
// Socket.io Setup
// =======================

const connectedUsers = {};

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // =======================
  // User Login / Register Socket
  // =======================

  socket.on("login", (email) => {
    connectedUsers[email] = socket.id;

    console.log("User registered:", email);
    console.log("Connected users:", connectedUsers);
  });

  // =======================
  // Send Message
  // =======================

  socket.on("send-message", async (message) => {
    try {
      console.log("Message received:", message);

      // Save message to MongoDB
      const newMessage = await Message.create({
        sender: message.sender,
        receiver: message.receiver,
        text: message.text,
      });

      // Convert MongoDB document into normal object
      const savedMessage = newMessage.toObject();

      console.log("Message saved:", savedMessage);

      // Find receiver's socket
      const receiverSocket =
        connectedUsers[message.receiver];

      // Send message to receiver if online
      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "receive-message",
          savedMessage
        );
      }

      // Send saved message back to sender
      socket.emit(
        "message-sent",
        savedMessage
      );

    } catch (error) {
      console.log(
        "Message save error:",
        error
      );
    }
  });

  // =======================
  // WEBRTC CALL SIGNALING
  // =======================

  // =======================
  // Caller -> Receiver
  // Send Call Request
  // =======================

  socket.on(
    "call-user",
    ({ receiver, offer, caller }) => {
      console.log(
        "Call request:",
        caller,
        "->",
        receiver
      );

      const receiverSocket =
        connectedUsers[receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "incoming-call",
          {
            caller,
            offer,
          }
        );

        console.log(
          "Incoming call sent to:",
          receiver
        );
      } else {
        socket.emit(
          "call-failed",
          {
            message: "User is offline",
          }
        );

        console.log(
          "Call failed. User is offline:",
          receiver
        );
      }
    }
  );

  // =======================
  // Receiver -> Caller
  // Accept Call
  // =======================

  socket.on(
    "accept-call",
    ({ caller, answer }) => {
      console.log(
        "Call accepted by:",
        caller
      );

      const callerSocket =
        connectedUsers[caller];

      if (callerSocket) {
        io.to(callerSocket).emit(
          "call-accepted",
          {
            answer,
          }
        );

        console.log(
          "Call answer sent to caller:",
          caller
        );
      } else {
        console.log(
          "Caller is no longer online:",
          caller
        );
      }
    }
  );

  // =======================
  // ICE Candidate
  // =======================

  socket.on(
    "ice-candidate",
    ({ receiver, candidate }) => {
      console.log(
        "ICE candidate received for:",
        receiver
      );

      const receiverSocket =
        connectedUsers[receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "ice-candidate",
          {
            candidate,
          }
        );

        console.log(
          "ICE candidate forwarded to:",
          receiver
        );
      }
    }
  );

  // =======================
  // Reject Call
  // =======================

  socket.on(
    "reject-call",
    ({ caller }) => {
      console.log(
        "Call rejected by:",
        socket.id
      );

      const callerSocket =
        connectedUsers[caller];

      if (callerSocket) {
        io.to(callerSocket).emit(
          "call-rejected"
        );

        console.log(
          "Call rejection sent to:",
          caller
        );
      }
    }
  );

  // =======================
  // End Call
  // =======================

  socket.on(
    "end-call",
    ({ receiver }) => {
      console.log(
        "Call ended. Receiver:",
        receiver
      );

      const receiverSocket =
        connectedUsers[receiver];

      if (receiverSocket) {
        io.to(receiverSocket).emit(
          "call-ended"
        );

        console.log(
          "Call-ended event sent to:",
          receiver
        );
      }
    }
  );

  // =======================
  // Disconnect
  // =======================

  socket.on("disconnect", () => {
    console.log(
      "User disconnected:",
      socket.id
    );

    for (const email in connectedUsers) {
      if (
        connectedUsers[email] ===
        socket.id
      ) {
        delete connectedUsers[email];
      }
    }

    console.log(
      "Updated users:",
      connectedUsers
    );
  });
});

// =======================
// Multer / Profile Upload
// =======================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
    );
  },
});

const upload = multer({
  storage,
});

app.use(
  "/uploads",
  express.static("uploads")
);

// =======================
// Upload Profile Image
// =======================

app.post(
  "/upload-profile",
  upload.single("profile"),
  async (req, res) => {
    try {
      console.log(req.file);

      if (!req.file) {
        return res.status(400).json({
          message:
            "Please select a profile picture",
        });
      }

      const token =
        req.cookies.token;

      if (!token) {
        return res.status(401).json({
          message: "No token",
        });
      }

      const decode =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      // Upload image to Cloudinary
      const result =
        await cloudinary.uploader.upload(
          req.file.path,
          {
            folder: "profileimage",
          }
        );

      // Save Cloudinary URL in MongoDB
      await User.findOneAndUpdate(
        {
          email: decode.email_id,
        },
        {
          profileImage:
            result.secure_url,
        }
      );

      res.json({
        message:
          "Profile uploaded successfully",
        profileImage:
          result.secure_url,
      });

    } catch (error) {
      console.log(
        "Profile upload error:",
        error
      );

      res.status(500).json({
        message:
          "Profile upload failed",
      });
    }
  }
);

// =======================
// Total Users
// =======================

app.get(
  "/totalusers",
  async (req, res) => {
    try {
      const users =
        await User.find({});

      res.json(users);

    } catch (error) {
      console.log(
        "Total users error:",
        error
      );

      res.status(500).json({
        message:
          "Error getting users",
      });
    }
  }
);

// =======================
// Add User / Signup
// =======================

app.post(
  "/adduser",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      const hashedPass =
        await bcrypt.hash(
          password,
          10
        );

      const newuser =
        new User({
          name,
          email,
          hashedPass,
        });

      await newuser.save();

      res.json({
        message:
          "User created successfully",
      });

    } catch (error) {
      console.log(
        "Add user error:",
        error
      );

      res.status(500).json({
        message:
          "Error creating user",
      });
    }
  }
);

// =======================
// Login
// =======================

app.post(
  "/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const findemail =
        await User.findOne({
          email,
        });

      if (!findemail) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const validatepassword =
        await bcrypt.compare(
          password,
          findemail.hashedPass
        );

      if (!validatepassword) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const jwt_token =
        jwt.sign(
          {
            email_id: email,
          },
          process.env.JWT_SECRET
        );

      res.cookie(
        "token",
        jwt_token,
        {
          httpOnly: true,
          maxAge:
            60 * 60 * 1000,
          sameSite: "none",
          secure: true,
        }
      );

      res.json({
        message:
          "login successful",
      });

    } catch (error) {
      console.log(
        "Login error:",
        error
      );

      res.status(500).json({
        message:
          "Login failed",
      });
    }
  }
);

// =======================
// Profile
// =======================

app.get(
  "/profile",
  async (req, res) => {
    try {
      const {
        token,
      } = req.cookies;

      if (!token) {
        return res.status(401).json({
          message: "No token",
        });
      }

      const decode =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const finduser =
        await User.findOne({
          email:
            decode.email_id,
        });

      if (!finduser) {
        return res.status(401).json({
          message:
            "User not found",
        });
      }

      res.json({
        name: finduser.name,
        email: finduser.email,
        profileImage:
          finduser.profileImage,
      });

    } catch (error) {
      console.log(error);

      res.status(401).json({
        message:
          "Invalid token",
      });
    }
  }
);

// =======================
// Search User
// =======================

app.get(
  "/search-user",
  async (req, res) => {
    try {
      const { name } =
        req.query;

      const users =
        await User.find({
          name: {
            $regex: name,
            $options: "i",
          },
        });

      res.json(users);

    } catch (error) {
      console.log(
        "Search user error:",
        error
      );

      res.status(500).json({
        message:
          "Error searching users",
      });
    }
  }
);

// =======================
// Get All Users
// =======================

app.get(
  "/users",
  async (req, res) => {
    try {
      const users =
        await User.find(
          {},
          {
            name: 1,
            email: 1,
            profileImage: 1,
          }
        );

      res.json(users);

    } catch (error) {
      console.log(
        "Users error:",
        error
      );

      res.status(500).json({
        message:
          "Error getting users",
      });
    }
  }
);

// =======================
// Get Conversation Messages
// =======================

app.get(
  "/messages/:email",
  async (req, res) => {
    try {
      const token =
        req.cookies.token;

      if (!token) {
        return res.status(401).json({
          message:
            "No token",
        });
      }

      const decode =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const currentUser =
        decode.email_id;

      const otherUser =
        req.params.email;

      const messages =
        await Message.find({
          $or: [
            {
              sender:
                currentUser,
              receiver:
                otherUser,
            },
            {
              sender:
                otherUser,
              receiver:
                currentUser,
            },
          ],
        }).sort({
          createdAt: 1,
        });

      res.json(messages);

    } catch (error) {
      console.log(
        "Get messages error:",
        error
      );

      res.status(500).json({
        message:
          "Error getting messages",
      });
    }
  }
);

// =======================
// Mark Messages As Read
// =======================

app.put(
  "/messages/:email/read",
  async (req, res) => {
    try {
      const token =
        req.cookies.token;

      if (!token) {
        return res.status(401).json({
          message:
            "No token",
        });
      }

      const decode =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const currentUser =
        decode.email_id;

      const otherUser =
        req.params.email;

      await Message.updateMany(
        {
          sender:
            otherUser,
          receiver:
            currentUser,
          read: false,
        },
        {
          $set: {
            read: true,
          },
        }
      );

      res.json({
        message:
          "Messages marked as read",
      });

    } catch (error) {
      console.log(
        "Mark read error:",
        error
      );

      res.status(500).json({
        message:
          "Error marking messages as read",
      });
    }
  }
);

// =======================
// Logout
// =======================

app.post(
  "/logout",
  (req, res) => {
    try {
      res.clearCookie(
        "token",
        {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        }
      );

      res.json({
        message:
          "Logout successful",
      });

    } catch (error) {
      console.log(
        "Logout error:",
        error
      );

      res.status(500).json({
        message:
          "Logout failed",
      });
    }
  }
);

// =======================
// Get Chat List
// =======================

app.get(
  "/chats",
  async (req, res) => {
    try {
      const token =
        req.cookies.token;

      if (!token) {
        return res.status(401).json({
          message:
            "No token",
        });
      }

      const decode =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const currentUser =
        decode.email_id;

      // Get all messages involving current user
      const messages =
        await Message.find({
          $or: [
            {
              sender:
                currentUser,
            },
            {
              receiver:
                currentUser,
            },
          ],
        }).sort({
          createdAt: -1,
        });

      const chats = [];

      for (
        const message of messages
      ) {
        // Find the other person
        const otherUser =
          message.sender ===
          currentUser
            ? message.receiver
            : message.sender;

        // Avoid duplicate users
        if (
          !chats.find(
            (chat) =>
              chat.email ===
              otherUser
          )
        ) {
          // Count unread messages
          const unreadCount =
            await Message.countDocuments({
              sender:
                otherUser,
              receiver:
                currentUser,
              read: false,
            });

          // Get user's profile
          const user =
            await User.findOne(
              {
                email:
                  otherUser,
              },
              {
                name: 1,
                email: 1,
                profileImage: 1,
              }
            );

          if (user) {
            chats.push({
              name:
                user.name,
              email:
                user.email,
              profileImage:
                user.profileImage,
              lastMessage:
                message.text,
              timestamp:
                message.createdAt,
              unreadCount,
            });
          }
        }
      }

      res.json(chats);

    } catch (error) {
      console.log(
        "Chat list error:",
        error
      );

      res.status(500).json({
        message:
          "Error getting chats",
      });
    }
  }
);

// =======================
// Start Server
// =======================

const PORT =
  process.env.PORT || 3000;

server.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);

