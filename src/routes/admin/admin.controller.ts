import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Admin from "./admin.model";
import User from "../user/user.model";

class accountdminController {
  async register(req: Request, res: Response) {
    try {
      const {
        username,
        email,
        password,
        role = "ADMIN",
        status = "ACTIVE",
      } = req.body;

      // Check if the admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(409)
          .json({ message: "Admin with that email already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create and save the new admin
      const newAdmin = new Admin({
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        status,
      });

      const savedAdmin = await newAdmin.save();

      // Generate a JWT token
      const token = jwt.sign(
        {
          id: savedAdmin._id,
          role: savedAdmin.role,
          username: savedAdmin.username,
          email: savedAdmin.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1d" }
      );

      // Remove sensitive information from the response
      const { _id, password: _, ...adminPayload } = savedAdmin.toObject();

      // Send success response
      return res.status(201).json({
        message: "Admin account created successfully",
        token,
        admin: { id: _id, ...adminPayload },
      });
    } catch (error: any) {
      console.error("Error in admin registration:", error);
      return res.status(500).json({
        message: "An error occurred during registration",
        error: error.message,
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email: email.toLowerCase() });

      if (!admin) {
        return res.status(404).json({
          message: "Account not found. Check login credentials and try again.",
        });
      }

      // Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid credentials. Check login details and try again.",
        });
      }

      // Check account status
      if (admin.status !== "ACTIVE") {
        return res.status(403).json({
          message: `Account is ${admin.status.toLowerCase()}. Please contact support.`,
        });
      }

      // Generate JWT token
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

      // Prepare admin object for response
      const adminObject = admin.toObject();
      const { _id, password: _, ...adminPayload } = adminObject;

      // Return successful response
      return res.status(200).json({
        message: "Login successful",
        token,
        admin: { id: _id, ...adminPayload },
      });
    } catch (error: any) {
      console.error("Error during login:", error.message);
      return res.status(500).json({
        message: "An error occurred during login. Please try again.",
        error: error.message,
      });
    }
  }

  async newPassword(req: Request, res: Response) {
    try {
      const { email, newPassword } = req.body;

      // Find the admin by email
      const admin = await Admin.findOne({ email });
      if (!admin) {
        return res
          .status(404)
          .json({ message: "Admin with this email does not exist" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      admin.password = hashedPassword;
      await admin.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      return res.status(500).json({
        message: "An error occurred while updating the password",
        error: error.message,
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Find the admin by ID
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Compare the current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        admin.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the password
      admin.password = hashedPassword;
      await admin.save();

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      console.error("Error updating password:", error.message);
      return res.status(500).json({
        message: "An error occurred while updating the password",
        error: error.message,
      });
    }
  }

  async admin(req: Request, res: Response) {
    try {
      // Fetch the admin by ID, excluding sensitive fields like password
      const admin = await Admin.findById(req.params.id)
        .select("-password")
        .lean();

      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Replace `_id` with `id` for consistency
      const { _id, ...rest } = admin;
      const adminPayload = { id: _id, ...rest };

      return res.status(200).json(adminPayload);
    } catch (error: any) {
      console.error("Error fetching admin:", error);
      return res.status(500).json({
        message: "An error occurred while fetching the admin",
        error: error.message,
      });
    }
  }

  async updateAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateFields = req.body;

      // Update the admin's fields
      const updatedAdmin = await Admin.findByIdAndUpdate(id, updateFields, {
        new: true, // Return the updated document
        runValidators: true, // Ensure schema validation
      }).select("-password");

      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      // Replace `_id` with `id`
      const { _id, ...rest } = updatedAdmin.toObject();
      const adminPayload = { id: _id, ...rest };

      return res.status(200).json({
        message: "Admin updated successfully",
        admin: adminPayload,
      });
    } catch (error: any) {
      console.error("Error updating admin:", error);
      return res.status(500).json({
        message: "An error occurred while updating the admin",
        error: error.message,
      });
    }
  }

  async deleteAdmin(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Delete the admin by ID
      const response = await Admin.findByIdAndDelete(id);

      if (!response) {
        return res.status(404).json({ message: "Admin not found" });
      }

      return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      return res.status(500).json({
        message: "An error occurred while deleting the admin",
        error: error.message,
      });
    }
  }

  //

  async listUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Convert page and limit to numbers
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      // Fetch users with pagination
      const users = await User.find()
        .select("-password") // Exclude password field
        .skip((pageNumber - 1) * limitNumber) // Skip records for previous pages
        .limit(limitNumber); // Limit the number of records

      // Get the total number of users
      const totalUsers = await User.countDocuments();

      return res.status(200).json({
        message: "Users fetched successfully",
        users,
        pagination: {
          totalUsers,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalUsers / limitNumber),
        },
      });
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      return res.status(500).json({
        message: "An error occurred while fetching users",
        error: error.message,
      });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params; // Extract the user ID from the request parameters

      // Fetch the user by ID
      const user = await User.findById(id).select("-password"); // Exclude the password field

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error.message);
      return res.status(500).json({
        message: "An error occurred while fetching the user",
        error: error.message,
      });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params; // Extract the user ID from request parameters
      const { status } = req.body; // Extract the new status from the request body

      // Validate the status
      const validStatuses = ["ACTIVE", "FROZEN", "SUSPENDED", "DEACTIVATED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Valid statuses are: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Find and update the user's status
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true } // Return the updated document and ensure schema validation
      ).select("-password"); // Exclude password field

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        message: "User status updated successfully",
        user: updatedUser,
      });
    } catch (error: any) {
      console.error("Error updating user status:", error.message);
      return res.status(500).json({
        message: "An error occurred while updating the user's status",
        error: error.message,
      });
    }
  }
}

export default accountdminController;
