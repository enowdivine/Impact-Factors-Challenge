import { Request, Response } from "express";
import User from "../user/user.model";

import {
  countryDistribution,
  countryData,
  westAfricanCountries,
} from "./algm.generators";
import { generateRandomUser } from "./algm.generators";

class AlgorithmController {
  async generateUsers(req: Request, res: Response) {
    try {
      const users: any[] = [];

      for (const [countryName, count] of Object.entries(countryDistribution)) {
        const country =
          countryData[countryName as keyof typeof countryData] ||
          countryData["Switzerland"]; // Default to Switzerland if missing

        for (let i = 0; i < count; i++) {
          const user = await generateRandomUser(country);
          users.push(user);
        }
      }

      // Ensure only 1000 users are generated
      if (users.length > 1000) {
        users.length = 1000; // Trim to exactly 1000
      }

      try {
        await User.insertMany(users); // Bulk insert users into the database
        console.log("1000 users generated and saved to the database.");
        return res.status(200).json({ message: "1000 users generated" });
      } catch (error) {
        console.error("Error saving users to the database:", error);
        return res
          .status(500)
          .json({ message: "Error saving users to the database" });
      }
    } catch (error: any) {
      console.error("Error generating users:", error);
      return res.status(500).json({ message: "Error generating users" });
    }
  }

  async updateAllUsers(req: Request, res: Response) {
    try {
      // Fetch all users with role 'USER'
      const users = await User.find({ role: "USER" });

      // Check if users exist
      if (!users || users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No users found to update",
        });
      }

      // Function to generate a random location within a given range around central coordinates
      const generateRandomLocation = (latitude: number, longitude: number) => {
        const randomOffset = () => (Math.random() - 0.5) * 0.1; // Offset of up to ±0.05 degrees
        return {
          latitude: latitude + randomOffset(),
          longitude: longitude + randomOffset(),
        };
      };

      // Loop through each user and update their currentLocation with offsets from their country's coordinates
      const updatePromises = users.map(async (user) => {
        // Get the country data for the user's country of origin
        const country = countryData[user.countryOfOrigin?.name];

        // If the country data exists, generate a random location
        if (country) {
          const randomLocation = generateRandomLocation(
            country.latitude,
            country.longitude
          );

          // Update the user's currentLocation with the generated random location
          return User.updateOne(
            { _id: user._id },
            {
              $set: {
                coordinates: [
                  randomLocation.latitude,
                  randomLocation.longitude,
                ],
              },
            },
            { upsert: true }
          );
        }
      });

      // Wait for all the updates to finish
      const results = await Promise.all(updatePromises);

      // Count the number of modified users
      const modifiedCount = results.filter(
        (result) => result && result.modifiedCount > 0
      ).length;

      console.log(
        `Successfully updated ${modifiedCount} users with new currentLocation.`
      );

      return res.status(200).json({
        success: true,
        modifiedCount: modifiedCount,
        message: "Users updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating users:", error);
      return res.status(500).json({
        message: error.message || "Error updating users",
      });
    }
  }

  async users(req: Request, res: Response) {
    try {
      // Default values for page and limit if not provided in the query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Calculate the starting index for the query based on page and limit
      const skip = (page - 1) * limit;

      // Fetch the total count of users
      const totalUsers = await User.countDocuments({
        role: "USER",
      });

      // Fetch the paginated users with only email, gender, and interestedGender fields
      const users = await User.find({
        role: "USER",
        coordinates: {
          $geoWithin: {
            $centerSphere: [[12.3547, 7.3697], 500 / 6371], // [longitude, latitude], radius in radians
          },
        },
      });

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
