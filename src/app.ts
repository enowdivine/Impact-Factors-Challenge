import express, { Request, Response } from "express";
import bodyParser = require("body-parser");
import dbConnect from "./config/db";
import dotenv from "dotenv";
import http from "http";
import cors from "cors";

// api imports
import adminRoutes from "./modules/admin/admin.routes";
import churchRoutes from "./modules/church/church.routes";
import templateRoutes from "./modules/template/template.routes";
import userRoutes from "./modules/user/user.routes";
import formRoutes from "./modules/form/form.routes";
import subdomainRoutes from "./modules/subdomain/subdomain.routes";

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

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(`/api/${process.env.API_VERSION}/admins`, adminRoutes);
app.use(`/api/${process.env.API_VERSION}/churches`, churchRoutes);
app.use(`/api/${process.env.API_VERSION}/templates`, templateRoutes);
app.use(`/api/${process.env.API_VERSION}/users`, userRoutes);
app.use(`/api/${process.env.API_VERSION}/forms`, formRoutes);
app.use(`/api/${process.env.API_VERSION}/subdomains`, subdomainRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send(`Impact Factors Server 🚀 `);
});

const PORT: any = process.env.PORT || 4100;
server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}, 🚀`);
});
