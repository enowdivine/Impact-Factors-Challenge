import express, { Request, Response } from "express";
import bodyParser = require("body-parser");
import dbConnect from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

// api imports
import adminRoutes from "./routes/admin/admin.routes";
import userRoutes from "./routes/user/user.routes";
import algorithmRoutes from "./routes/algorithm/algm.routes";
import notificationRoutes from "./routes/notifications/notification.routes";
import paymentRoutes from "./routes/payments/stripe.routes";
import subscriptionRoutes from "./routes/subscriptions/subscription.routes";
import reportRoutes from "./routes/userReports/report.routes";
import supportRoutes from "./routes/support/report.routes";

import sendEmail from "./services/email/email";

import StripeController from "./routes/payments/stripe.controller";

const path = require("path");
export const appRoot = path.resolve(__dirname);

const corsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionSuccessStatus: 200,
};

dotenv.config();
dbConnect();

const app = express();
const server: any = http.createServer(app);
const stripe = new StripeController();

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend access
    methods: ["GET", "POST"],
  },
});

// Store connected users
const connectedUsers: Record<string, string> = {};

// Handle WebSocket Connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Register user with their socket ID
  socket.on("register", (userId) => {
    connectedUsers[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key] === socket.id
    );
    if (userId) {
      delete connectedUsers[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});

// Make io accessible in other files
export { io, connectedUsers };

app.use(cors(corsOptions));

app.post(
  `/api/${process.env.API_VERSION}/callback/webhook`,
  express.raw({ type: "application/json" }),
  stripe.handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(`/api/${process.env.API_VERSION}/admins`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/users`, userRoutes);
app.use(`/api/${process.env.API_VERSION}/algorithm`, algorithmRoutes);
app.use(`/api/${process.env.API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${process.env.API_VERSION}/stripe`, paymentRoutes);
app.use(`/api/${process.env.API_VERSION}/subscriptions`, subscriptionRoutes);
app.use(`/api/${process.env.API_VERSION}/reports`, reportRoutes);
app.use(`/api/${process.env.API_VERSION}/supports`, supportRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send(`Bliss Server 🚀 `);
});

const PORT: any = process.env.PORT || 4100;
server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}, 🚀`);
});
