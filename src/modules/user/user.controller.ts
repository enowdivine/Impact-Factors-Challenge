import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./user.model";

class UserController {
  async register(req: Request, res: Response) {
    try {
      const { username, email, password, churchId } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        church: churchId,
      });

      await newUser.save();

      return res.status(201).json({ message: "User registered successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      return res.status(200).json({ message: "Login successful", token });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Login failed", error: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user = await User.findById((req as any).user.id).select(
        "-password"
      );
      if (!user) return res.status(404).json({ message: "User not found" });

      return res.status(200).json(user);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Profile retrieval failed", error: error.message });
    }
  }
}

export default UserController;
