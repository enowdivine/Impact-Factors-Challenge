import express, { Request, Response } from "express";
import bodyParser = require("body-parser");
import dbConnect from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";
// api imports
import eventRoutes from "./routes/events/event.routes";
import newsRoutes from "./routes/news/resource.routes";
import partnerRouttes from "./routes/partners/resource.routes";
import testimonialRoutes from "./routes/testimonials/resource.routes";

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
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  },
});

dbConnect();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "uploads/gallery")));
app.use(`/api/${process.env.API_VERSION}/events`, eventRoutes);
app.use(`/api/${process.env.API_VERSION}/news`, newsRoutes);
app.use(`/api/${process.env.API_VERSION}/partners`, partnerRouttes);
app.use(`/api/${process.env.API_VERSION}/testimonils`, testimonialRoutes);

// Payment webhook
let socketID: any;
io.on("connection", async (socket: any) => {
  console.log("New participant connected");
  socket.on("join", (room: any) => {
    socket.join(room);
    socketID = socket.id;
    console.log(`${socket.id} joined ${room}`);
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Gilgal Towers Server 🚀");
});

const PORT: any = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}, 🚀`);
});
