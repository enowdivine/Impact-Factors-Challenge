import express, { Request, Response } from "express";
import bodyParser = require("body-parser");
import dbConnect from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
// api imports
import adminRoutes from "./routes/admin/admin.routes";
import eventRoutes from "./routes/events/resource.routes";
import teamRoutes from "./routes/team/resource.routes";

import programRoutes from "./routes/programs/resource.routes";
import categoryRoutes from "./routes/categories/resource.routes";
import courseRoutes from "./routes/courses/resource.routes";
import campusRoutes from "./routes/campus/resource.routes";

const path = require("path");
export const appRoot = path.resolve(__dirname);

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

dotenv.config();
const app = express();
const server: any = http.createServer(app);

dbConnect();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/uploads/gallery/", express.static(__dirname + "/uploads/gallery/"));
app.use(`/api/${process.env.API_VERSION}/admin`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/events`, eventRoutes);
app.use(`/api/${process.env.API_VERSION}/team`, teamRoutes);

app.use(`/api/${process.env.API_VERSION}/programmes`, programRoutes);
app.use(`/api/${process.env.API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${process.env.API_VERSION}/courses`, courseRoutes);
app.use(`/api/${process.env.API_VERSION}/campuses`, campusRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("St Louis Server 🚀");
});

const PORT: any = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}, 🚀`);
});
