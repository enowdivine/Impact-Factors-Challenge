import express, { Request, Response } from "express";
import bodyParser = require("body-parser");
import dbConnect from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
// api imports
import adminRoutes from "./routes/admin/admin.routes";
import userRoutes from "./routes/user/user.routes";
import algorithmRoutes from "./routes/algorithm/algm.routes";
import notificationRoutes from "./routes/notifications/notification.routes";
import paymentRoutes from "./routes/payments/stripe.routes";
import subscriptionRoutes from "./routes/subscriptions/subscription.routes";
import reportRoutes from "./routes/userReports/report.routes";
import supportRoutes from "./routes/support/report.routes";

import StripeController from "./routes/payments/stripe.controller";
const stripe = new StripeController();

const path = require("path");
export const appRoot = path.resolve(__dirname);

const corsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionSuccessStatus: 200,
};

dotenv.config();
const app = express();
const server: any = http.createServer(app);

dbConnect();

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
