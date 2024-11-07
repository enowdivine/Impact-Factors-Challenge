import { Request, Response } from "express";
import User from "../user/user.model";
import { generateRandomUser } from "./generators/algm.generators";

class AlgorithmController {
  async generateUsers(req: Request, res: Response) {
    try {
      const users = [];
      for (let i = 0; i < 1000; i++) {
        const user = await generateRandomUser();
        users.push(user);
      }

      try {
        await User.insertMany(users);
        console.log("1000 users generated and saved to the database.");
        return res.status(200).json({ users: users.length });
      } catch (error) {
        console.error("Error saving users:", error);
        return res
          .status(500)
          .json({ message: "Error saving users to the database" });
      }
    } catch (error: any) {
      console.log("Error generatiing users:", error);
      return res.status(500).json({ message: "Error generating users" });
    }
  }

  async users(req: Request, res: Response) {
    try {
      // Default values for page and limit if not provided in the query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Calculate the starting index for the query based on page and limit
      const skip = (page - 1) * limit;

      // Fetch the total count of users excluding the current user
      const totalUsers = await User.countDocuments({
        role: "USER",
        gender: "MAN",
      });

      // Fetch the paginated users excluding the current user
      const users = await User.find({
        role: "USER",
        gender: "MAN",
      })
        .sort({ createdAt: -1 })
        .skip(skip) // Skip users for previous pages
        .limit(limit); // Limit the number of users per page

      return res.status(200).json({
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers: totalUsers,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }
}

export default AlgorithmController;
