import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Response, Request, NextFunction } from "express";
dotenv.config();

export default function (req: Request, res: Response, next: NextFunction) {
  if (!req.headers["authorization"]) {
    return res.status(403).send("Unauthorized Request !!");
  }
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: any, payload: any) => {
      if (err)
        return res.json({
          success: false,
          message: "Invalid Token",
        });
      if (payload) {
        next();
      } else {
        return res.json({
          success: false,
          message: "Unauthorized Request !!",
        });
      }
    }
  );
}
