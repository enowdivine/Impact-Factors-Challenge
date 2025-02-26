import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "./admin.model";

class AdminController {
  async registerSuperAdmin(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Prevent multiple SuperAdmins
      const existingSuperAdmin = await Admin.findOne({ role: "SUPERADMIN" });
      if (existingSuperAdmin) {
        return res.status(403).json({ message: "SuperAdmin already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newSuperAdmin = new Admin({
        username,
        email,
        password: hashedPassword,
        role: "SUPERADMIN", // ✅ Only SuperAdmins can register
      });

      const savedSuperAdmin = await newSuperAdmin.save();

      return res.status(201).json({
        message: "SuperAdmin registered successfully",
        admin: {
          id: savedSuperAdmin._id,
          username: savedSuperAdmin.username,
          email: savedSuperAdmin.email,
          role: savedSuperAdmin.role,
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Registration failed", error: error.message });
    }
  }

  async createAdmin(req: Request, res: Response) {
    try {
      const { username, email, password, churchId } = req.body;

      if (!churchId) {
        return res
          .status(400)
          .json({ message: "Church ID is required to create an Admin" });
      }

      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(409)
          .json({ message: "Admin with this email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newAdmin = new Admin({
        username,
        email,
        password: hashedPassword,
        role: "ADMIN",
        churchId,
      });

      await newAdmin.save();

      return res.status(201).json({ message: "Admin created successfully" });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to create Admin", error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const admin = await Admin.findOne({ email: email.toLowerCase() });

      if (!admin) {
        return res.status(404).json({
          message: "Account not found. Check login credentials and try again.",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid credentials. Check login details and try again.",
        });
      }

      if (admin.status !== "ACTIVE") {
        return res.status(403).json({
          message: `Account is ${admin.status.toLowerCase()}. Please contact support.`,
        });
      }

      const token = jwt.sign(
        {
          id: admin._id,
          role: admin.role,
          username: admin.username,
          email: admin.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          churchId: admin.churchId || null,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred during login",
        error: error.message,
      });
    }
  }

  async getAdmin(req: Request, res: Response) {
    try {
      const admin = await Admin.findById(req.params.id)
        .select("-password")
        .lean();
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      return res.status(200).json(admin);
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while fetching the admin",
        error: error.message,
      });
    }
  }

  async deleteAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const response = await Admin.findByIdAndDelete(id);
      if (!response) {
        return res.status(404).json({ message: "Admin not found" });
      }

      return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({
        message: "An error occurred while deleting the admin",
        error: error.message,
      });
    }
  }
}

export default AdminController;
