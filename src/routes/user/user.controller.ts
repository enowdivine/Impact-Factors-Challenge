import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import UserMatch from "../algorithm/algm.model";
import UserInteraction from "./user.interactionModel";
import UserDailyMatch from "./user.dailyMatchModel";
import NotificationModel from "../notifications/notification.model";

import bcrypt from "bcrypt";
import _ from "lodash";

import sendEmail from "../../services/email/email";
import { userSignup, matchNotification } from "./templates/email";
import { generateToken } from "../streamChat/stream.controller";
import { computeMatchScores, updateMatchScores } from "../algorithm/algorithm";
import VerificationCode from "./user.verificationCodeModel";
import {
  differenceInMonths,
  generateVerificationCode,
} from "../../helpers/utils";
import { getTwoBestMatches } from "./user.helperFunctions";
import { haversineDistanceCalculator } from "../../helpers/utils";

const generateAndStoreCode = async (email: string) => {
  const code = generateVerificationCode();
  await VerificationCode.findOneAndUpdate(
    { email },
    { code, createdAt: new Date() },
    { upsert: true }
  );
  return code;
};

class UserController {
  async register(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (user) {
        return res.status(409).json({
          message: "User with that email already exist",
        });
      }

      const hash = await bcrypt.hash(req.body.password, 10);
      const defaultCoordinates = {
        type: "Point",
        coordinates: [0, 0], // Default longitude and latitude
      };
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        password: hash,
        coordinates: req.body.coordinates || defaultCoordinates,
        emailVerified: true,
      });
      newUser
        .save()
        .then(async (response) => {
          const token: string = jwt.sign(
            {
              id: response._id,
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
            },
            process.env.JWT_SECRET as string
          );
          const streamResult = await generateToken(
            response._id.toString(),
            response.firstName,
            response.lastName,
            response.email,
            response.profilePicture.url
          );
          // Generate the six-digit verification code
          // const verificationCode = await generateAndStoreCode(req.body.email.toLowerCase());

          // // Send verification code via email
          // sendEmail({
          //   to: req.body.email.toLowerCase(),
          //   title: "Welcome To Bliss Dating",
          //   subject: "Verify Your Email",
          //   message: userSignup(req.body.firstName, verificationCode),
          // });

          const userObject = response.toObject();
          const { _id, password: pw, ...rest } = userObject;
          const userPayload = { id: _id, ...rest };

          return res.status(201).json({
            message: "user created",
            token: token,
            streamToken: streamResult.token,
            user: userPayload,
          });
        })
        .catch((err: any) => {
          console.log(err);
          return res.status(500).json({
            message: err.message || "Error creating user",
            error: err,
          });
        });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error in user registration",
      });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const storedCode = await VerificationCode.findOne({
        email: req.body.email.toLowerCase(),
      }).sort({ createdAt: -1 }); // Get the most recent code;

      console.log("storedCode", storedCode);
      console.log("code body", req.body.code);

      if (!storedCode) {
        // The code has likely expired or was never created
        return res.status(400).json({
          message: "Code expired or not found. Please request a new code.",
        });
      }

      if (
        parseInt(storedCode?.code?.toString() || "0", 10) !==
        parseInt(req.body.code.toString(), 10)
      ) {
        return res.status(400).json({ message: "Invalid verification code." });
      }

      // // Mark the user as verified
      // const user = await User.findOneAndUpdate(
      //   { email: req.body.email.toLowerCase() },
      //   { emailVerified: true }
      // );

      // if (user) {
      // Delete the used verification code
      await VerificationCode.deleteMany({
        email: req.body.email.toLowerCase(),
      });
      return res.status(200).json({ message: "Email verified successfully!" });
      // } else {
      //   return res.status(404).json({ message: "User not found." });
      // }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error in user registration",
      });
    }
  }

  async emailVerification(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (user) {
        res.status(409).json({
          message: "User with that email already exist",
        });
      } else {
        // Generate the six-digit verification code
        console.log("request body", req.body);
        const verificationCode = await generateAndStoreCode(
          req.body.email.toLowerCase()
        );

        // Send verification code via email
        sendEmail({
          to: req.body.email.toLowerCase(),
          title: "Email verification code",
          subject: "Verify Your Email",
          message: userSignup(req.body.firstName, verificationCode),
        });

        res.status(201).json({
          message: "Code generated",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error in generating code",
      });
    }
  }
  // async register(req: Request, res: Response) {
  //   try {
  //     const user = await User.findOne({ email: req.body.email.toLowerCase() });
  //     if (user) {
  //       return res.status(409).json({
  //         message: "User with that email already exist",
  //       });
  //     }

  //     const hash = await bcrypt.hash(req.body.password, 10);
  //     const defaultCoordinates = {
  //       type: "Point",
  //       coordinates: [0, 0], // Default longitude and latitude
  //     };
  //     const newUser = new User({
  //       firstName: req.body.firstName,
  //       lastName: req.body.lastName,
  //       username: req.body.username,
  //       email: req.body.email.toLowerCase(),
  //       password: hash,
  //       coordinates: req.body.coordinates || defaultCoordinates,
  //       emailVerified: true,
  //     });
  //     newUser
  //       .save()
  //       .then(async (response) => {
  //         const token: string = jwt.sign(
  //           {
  //             id: response._id,
  //             firstName: response.firstName,
  //             lastName: response.lastName,
  //             email: response.email,
  //           },
  //           process.env.JWT_SECRET as string
  //         );
  //         const streamResult = await generateToken(
  //           response._id.toString(),
  //           response.firstName,
  //           response.lastName,
  //           response.email,
  //           response.profilePicture.url
  //         );
  //         // Generate the six-digit verification code
  //         // const verificationCode = await generateAndStoreCode(req.body.email.toLowerCase());

  //         // // Send verification code via email
  //         // sendEmail({
  //         //   to: req.body.email.toLowerCase(),
  //         //   title: "Welcome To Bliss Dating",
  //         //   subject: "Verify Your Email",
  //         //   message: userSignup(req.body.firstName, verificationCode),
  //         // });

  //         const userObject = response.toObject();
  //         const { _id, password: pw, ...rest } = userObject;
  //         const userPayload = { id: _id, ...rest };

  //         return res.status(201).json({
  //           message: "user created",
  //           token: token,
  //           streamToken: streamResult.token,
  //           user: userPayload,
  //         });
  //       })
  //       .catch((err: any) => {
  //         console.log(err);
  //         return res.status(500).json({
  //           message: err.message || "Error creating user",
  //           error: err,
  //         });
  //       });
  //   } catch (error: any) {
  //     return res.status(500).json({
  //       message: error.message || "Error in user registration",
  //     });
  //   }
  // }

  // async verifyEmail(req: Request, res: Response) {
  //   try {
  //     const storedCode = await VerificationCode.findOne({
  //       email: req.body.email.toLowerCase(),
  //     });

  //     if (!storedCode) {
  //       // The code has likely expired or was never created
  //       return res.status(400).json({
  //         message: "Code expired or not found. Please request a new code.",
  //       });
  //     }

  //     if (storedCode.code != req.body.code) {
  //       return res.status(400).json({ message: "Invalid verification code." });
  //     }

  //     // // Mark the user as verified
  //     const user = await User.findOneAndUpdate(
  //       { email: req.body.email.toLowerCase() },
  //       { emailVerified: true }
  //     );

  //     if (user) {
  //       // Delete the used verification code
  //       await VerificationCode.deleteOne({ email: req.body.email.toLowerCase() });
  //       return res
  //         .status(200)
  //         .json({ message: "Email verified successfully!" });
  //     } else {
  //       return res.status(404).json({ message: "User not found." });
  //     }
  //   } catch (error: any) {
  //     return res.status(500).json({
  //       message: error.message || "error in user registration",
  //     });
  //   }
  // }

  async login(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });

      if (user) {
        // Check user status
        if (user.status !== "ACTIVE") {
          let message = "Account is currently not active.";
          if (user.status === "FROZEN") {
            message = "Your account is frozen. Please contact support.";
          } else if (user.status === "SUSPENDED") {
            message = "Your account has been suspended.";
          } else if (user.status === "DEACTIVATED") {
            message = "Your account has been deactivated.";
          }
          return res.status(403).json({ message, status: user.status });
        }

        if (!user?.emailVerified) {
          // Generate the six-digit verification code
          const verificationCode = await generateAndStoreCode(
            req.body.email.toLowerCase()
          );

          // Send verification code via email
          sendEmail({
            to: req.body.email.toLowerCase(),
            title: "Email verification code",
            subject: "Verify Your Email",
            message: userSignup(user.firstName, verificationCode),
          });

          const userObject = user.toObject();
          const { _id, password: pw, ...rest } = userObject;
          const userPayload = { id: _id, ...rest };

          return res.status(200).json({
            message: "Success",
            user: userPayload,
          });
        }

        bcrypt.compare(
          req.body.password,
          user.password!,
          async (err: any, result: any) => {
            if (err) {
              return res.status(401).json({
                message:
                  "Authentication failed. Check login credentials and try again.",
              });
            }
            if (result) {
              const token: string = jwt.sign(
                {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                },
                process.env.JWT_SECRET as string
              );

              const streamResult = await generateToken(
                user._id.toString(),
                user.firstName,
                user.lastName,
                user.email,
                user.profilePicture.url
              );

              // Check if last login was more than a month ago
              const lastLogin = user.lastLogin || new Date(0); // Default to epoch if no login date is present
              const now = new Date();

              if (differenceInMonths(now, lastLogin) > 1) {
                // Trigger compute scores in the background
                setImmediate(async () => {
                  try {
                    await computeMatchScores(user._id.toString());
                    console.log(`Scores recomputed for user: ${user._id}`);
                  } catch (error: any) {
                    console.error("Error recomputing scores:", error.message);
                  }
                });
              }

              // Update the last login timestamp
              user.lastLogin = new Date();
              await user.save();

              const userObject = user.toObject();
              const { _id, password: pw, ...rest } = userObject;
              const userPayload = { id: _id, ...rest };

              return res.status(200).json({
                message: "Login successful",
                token: token,
                streamToken: streamResult.token,
                user: userPayload,
                status: user.status,
              });
            }
          }
        );
      } else {
        return res.status(404).json({
          message: "Account not found. Check login credentials and try again.",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message:
          error.message ||
          "Authentication failed. Check login credentials and try again.",
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (!user) {
        return res.status(409).json({
          message: "User does not exist. Check your email address.",
        });
      } else {
        // Generate the six-digit verification code
        const verificationCode = await generateAndStoreCode(
          req.body.email.toLowerCase()
        );

        // Send verification code via email
        sendEmail({
          to: req.body.email.toLowerCase(),
          title: "Email verification code",
          subject: "Verify Your Email",
          message: userSignup(user.firstName, verificationCode),
        });

        res.status(201).json({
          message: "success",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error in generating code",
      });
    }
  }

  // async emailVerification(req: Request, res: Response) {
  //   try {
  //     const user = await User.findOne({ email: req.body.email.toLowerCase() });
  //     if (user) {
  //       res.status(409).json({
  //         message: "User with that email already exist",
  //       });
  //     } else {
  //       // Generate the six-digit verification code
  //       console.log("request body", req.body);
  //       const verificationCode = await generateAndStoreCode(req.body.email.toLowerCase());

  //       // Send verification code via email
  //       sendEmail({
  //         to: req.body.email.toLowerCase(),
  //         title: "Email verification code",
  //         subject: "Verify Your Email",
  //         message: userSignup(req.body.firstName, verificationCode),
  //       });

  //       res.status(201).json({
  //         message: "Code generated",
  //       });
  //     }
  //   } catch (error: any) {
  //     res.status(500).json({
  //       message: error.message || "Error in generating code",
  //     });
  //   }
  // }

  async newPassword(req: Request, res: Response) {
    try {
      let user = await User.findOne({ email: req.body.email.toLowerCase() });
      if (user) {
        const { newPassword } = req.body;
        bcrypt.hash(newPassword, 10, async (error: any, hash: any) => {
          if (error) {
            return res.status(500).json({
              error: error,
              message: error.message || error,
            });
          }
          const passwordUpdate = {
            password: hash,
          };
          user = _.extend(user, passwordUpdate);
          user
            .save()
            .then((result: any) => {
              res.status(200).json({
                message: "Password updated",
              });
            })
            .catch((error: any) => {
              res.status(500).json({
                error: error,
                message: error.message || error,
              });
            });
        });
      } else {
        return res.status(500).json({
          message: "User does not exist",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error updating password",
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    let user = await User.findOne({ _id: req.params.id });
    if (user) {
      const { currentPassword, newPassword } = req.body;
      bcrypt
        .compare(currentPassword, user.password!)
        .then((match: any) => {
          if (match) {
            bcrypt.hash(newPassword, 10, async (error: any, hash: any) => {
              if (error) {
                return res.status(500).json({
                  error: error.message || error,
                });
              }
              const passwordUpdate = {
                password: hash,
              };

              user = _.extend(user, passwordUpdate);
              if (user) {
                user
                  .save()
                  .then((result: any) => {
                    res.status(200).json({
                      message: "password updated",
                    });
                  })
                  .catch((error: any) => {
                    res.status(500).json({
                      error: error.message || error,
                    });
                  });
              }
            });
          } else {
            return res.status(500).json({
              message: "passwords do not match",
            });
          }
        })
        .catch((err: any) => {
          return res.status(401).json({
            error: err.message || err,
          });
        });
    }
  }

  async user(req: Request, res: Response) {
    try {
      // Fetch the user by ID, excluding sensitive fields like password
      const data = await User.findOne({ _id: req.params.id })
        .select("-password") // Exclude password
        .lean(); // Return plain JavaScript object for better performance

      if (!data) {
        return res.status(404).json({
          message: "No user found",
        });
      }

      // Destructure to replace `_id` with `id`
      const { _id, ...rest } = data;
      const userWithId = {
        id: _id, // Add `id` field
        ...rest, // Spread remaining properties
      };

      return res.status(200).json(userWithId);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      return res.status(500).json({
        message: error.message || "Error fetching user data",
      });
    }
  }

  async users(req: Request, res: Response) {
    try {
      const currentUserId = req.params.id;

      // Fetch the current user's age range preferences
      const currentUser = await User.findById(currentUserId);
      if (!currentUser || !currentUser.partnerAge) {
        return res.status(400).json({
          message: "User's age range preferences are not defined.",
        });
      }

      await getTwoBestMatches(currentUserId);

      // Default values for page and limit if not provided in the query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Calculate the starting index for the query based on page and limit
      const skip = (page - 1) * limit;

      // Step 1: Fetch liked and disliked users from UserInteraction
      const interactions = await UserInteraction.find({ user: currentUserId })
        .select("targetUser type")
        .lean();

      const excludedUserIds = interactions
        .filter((interaction) => interaction.targetUser) // Remove null/undefined values
        .map((interaction) => interaction.targetUser.toString());

      // Step 2: Fetch daily matches for the current user
      const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const dailyMatch = await UserDailyMatch.findOne({
        user: currentUserId,
        date: today,
      }).select("matches");
      const dailyMatchIds = dailyMatch ? dailyMatch.matches : [];

      // Combine excluded user IDs and daily match IDs
      const allExcludedUserIds = [...excludedUserIds, ...dailyMatchIds];

      // Step 3: Fetch scored users from the UserMatch collection, excluding liked/disliked users
      const scoredUsers = await UserMatch.find({
        user1: currentUserId,
        user2: { $nin: allExcludedUserIds }, // Exclude users the current user has liked or disliked
      })
        .sort({ score: -1 }) // Sort by score descending
        .populate({
          path: "user2",
          select: "-password",
          match: {
            age: {
              $gte: currentUser.partnerAge.minValue,
              $lte: currentUser.partnerAge.maxValue,
            },
          },
        }) // Populate user2's details but exclude sensitive fields like password
        .exec();

      if (scoredUsers.length <= 10) {
        // Trigger compute scores in the background
        setImmediate(async () => {
          try {
            await computeMatchScores(currentUserId);
            console.log(`Scores recomputed for user: ${currentUserId}`);
          } catch (error: any) {
            console.error("Error recomputing scores:", error.message);
          }
        });
      }
      // Filter out entries where user2 is null
      const validScoredUsers = scoredUsers.filter(
        (scoredUser) => scoredUser.user2 !== null
      );
      const totalValidScoredUsers = validScoredUsers.length;
      const paginatedScoredUsers = validScoredUsers.slice(skip, skip + limit);

      // Step 3: Get the total number of scored users for pagination metadata
      // const totalMatches = await UserMatch.countDocuments({
      //   user1: currentUserId,
      //   user2: { $nin: allExcludedUserIds }, // Exclude users the current user has liked or disliked
      // });

      // Step 4: Check if there are no scored users
      if (paginatedScoredUsers.length === 0) {
        return res.status(200).json({
          users: [],
          currentPage: page,
          totalPages: 0,
          totalUsers: 0,
          message: "No matches found.",
        });
      }

      // Step 5: Return the paginated matches
      return res.status(200).json({
        users: paginatedScoredUsers.map((match) => match.user2), // Extract user2 details from matches
        currentPage: page,
        totalPages: Math.ceil(totalValidScoredUsers / limit),
        totalUsers: totalValidScoredUsers,
      });
    } catch (error: any) {
      console.error("Error fetching users", error.message);
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async twoBestMatches(req: Request, res: Response) {
    try {
      const requestingUserId = req.params.id;
      const matches = await getTwoBestMatches(requestingUserId);

      if (matches.length === 0) {
        return res.status(200).json([]);
      }

      return res.status(200).json(matches);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async toggleLikeUser(req: Request, res: Response) {
    try {
      const { userId, likedUserId } = req.params;

      if (!userId || !likedUserId) {
        return res
          .status(400)
          .json({ message: "Both userId and likedUserId are required." });
      }

      // Find the user performing the like action
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if the user is premium
      const isPremium = user.premium?.isPremium;

      // Reset the daily likes if the day has changed
      const now = new Date();
      if (
        !user.likesToday?.resetAt || // No reset date defined
        now > new Date(user.likesToday.resetAt) // Reset if past reset date
      ) {
        user.likesToday = {
          count: 0,
          resetAt: new Date(now.setHours(23, 59, 59, 999)), // End of the day
        };
        await user.save(); // Save the reset
      }

      // Enforce the like limit for non-premium users
      if (!isPremium && user.likesToday.count >= 20) {
        return res.status(403).json({
          message:
            "You have reached your daily like limit. Upgrade to premium for unlimited likes.",
        });
      }

      // Check if there is an existing interaction
      const existingInteraction = await UserInteraction.findOne({
        user: userId,
        targetUser: likedUserId,
      });

      if (existingInteraction) {
        if (existingInteraction.type === "LIKE") {
          // If already liked, toggle to "unlike"
          await UserInteraction.deleteOne({ _id: existingInteraction._id });
          return res.status(200).json({
            message: "User unliked successfully.",
            likesToday: user.likesToday,
          });
        } else {
          // If previously disliked, update to "LIKE"
          existingInteraction.type = "LIKE";
          await existingInteraction.save();
        }
      } else {
        // No existing interaction, create a new like
        const newInteraction = new UserInteraction({
          user: userId,
          targetUser: likedUserId,
          type: "LIKE",
        });
        await newInteraction.save();

        // Increment the daily like count
        user.likesToday.count += 1;
        await user.save();
      }

      // Check if the liked user has also liked the current user (mutual match)
      const reciprocalInteraction = await UserInteraction.findOne({
        user: likedUserId,
        targetUser: userId,
        type: "LIKE",
      });

      if (reciprocalInteraction) {
        const likedUserDetails = await User.findById(likedUserId);
        if (!likedUserDetails) {
          return res.status(404).json({ message: "Liked user not found." });
        }

        // Notifications
        const notificationForCurrentUser = new NotificationModel({
          userId: userId,
          type: "Matches",
          message: `New match with ${likedUserDetails?.firstName}`,
          icon: "podium",
          backgroundColor: "#B8E7FE",
          color: "#00C2FF",
        });
        await notificationForCurrentUser.save();

        const notificationForLikedUser = new NotificationModel({
          userId: likedUserId,
          type: "Matches",
          message: `New match with ${user?.firstName}`,
          icon: "podium",
          backgroundColor: "#B8E7FE",
          color: "#00C2FF",
        });
        await notificationForLikedUser.save();

        // It's a match! Send notifications to both users
        sendEmail({
          to: user.email,
          title: "It's a Match!",
          subject: "You Have a New Match on Bliss Dating",
          message: matchNotification(
            user.firstName,
            likedUserDetails?.firstName as string
          ),
        });
        sendEmail({
          to: likedUserDetails?.email as string,
          title: "It's a Match!",
          subject: "You Have a New Match on Bliss Dating",
          message: matchNotification(
            likedUserDetails?.firstName as string,
            user.firstName
          ),
        });
      }

      return res.status(200).json({
        message: "User liked successfully.",
        likesToday: user.likesToday,
      });
    } catch (error: any) {
      console.error("Error toggling like status:", error);
      return res.status(500).json({
        message: error.message || "Error toggling like/unlike status.",
      });
    }
  }

  async dislikeUser(req: Request, res: Response) {
    try {
      const { userId, dislikedUserId } = req.params;

      if (!userId || !dislikedUserId) {
        return res
          .status(400)
          .json({ message: "Both userId and dislikedUserId are required." });
      }

      // Check if a dislike interaction already exists
      const existingInteraction = await UserInteraction.findOne({
        user: userId,
        targetUser: dislikedUserId,
        type: "DISLIKE",
      });

      if (existingInteraction) {
        // Remove the dislike interaction
        await UserInteraction.deleteOne({
          user: userId,
          targetUser: dislikedUserId,
          type: "DISLIKE",
        });

        return res.status(200).json({
          message: "User removed from dislikes successfully.",
        });
      } else {
        // Create a new dislike interaction
        const newDislike = new UserInteraction({
          user: userId,
          targetUser: dislikedUserId,
          type: "DISLIKE",
        });

        await newDislike.save();

        return res.status(200).json({
          message: "User disliked successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error toggling dislike status:", error);
      return res.status(500).json({
        message: error.message || "Error toggling dislike status.",
      });
    }
  }

  async likedMeUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id; // ID of the current user

      // Default values for pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Fetch the current user's interactions (liked or disliked users)
      const excludedInteractions = await UserInteraction.find({
        user: userId,
        type: { $in: ["LIKE", "DISLIKE"] },
      }).select("targetUser");

      // Extract IDs of users the current user has liked or disliked
      const excludedUserIds = excludedInteractions.map(
        (interaction) => interaction.targetUser
      );

      // Find all interactions where the targetUser is the current user and type is "LIKE"
      const likes = await UserInteraction.find({
        targetUser: userId,
        type: "LIKE",
      })
        .select("user") // Only select the user who liked
        .skip(skip)
        .limit(limit);

      // Extract the user IDs from the interactions
      const likedUserIds = likes.map((interaction) => interaction.user);

      // Fetch the full user details for the liked users, excluding sensitive fields
      const likedUsers = await User.find({
        _id: { $in: likedUserIds, $nin: excludedUserIds },
      }).select("-password");

      // Fetch total count for pagination purposes
      const totalUsers = await UserInteraction.countDocuments({
        targetUser: userId,
        type: "LIKE",
      });

      return res.status(200).json({
        users: likedUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers: totalUsers,
      });
    } catch (error: any) {
      console.error("Error fetching likedMe users:", error);
      return res.status(500).json({
        message: error.message || "Error fetching likedMe users",
      });
    }
  }

  async mutualLikedUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id; // ID of the current user

      // Find users that the current user has liked
      const likedByMe = await UserInteraction.find({
        user: userId,
        type: "LIKE",
      }).select("targetUser");

      // Extract targetUser IDs from the interactions
      const likedByMeIds = likedByMe.map(
        (interaction) => interaction.targetUser
      );

      if (likedByMeIds.length === 0) {
        return res.status(200).json([]); // No likes made by the user
      }

      // Find users who have liked the current user and are also in likedByMeIds
      const mutualLikes = await UserInteraction.find({
        user: { $in: likedByMeIds },
        targetUser: userId,
        type: "LIKE",
      }).select("user");

      // Extract the IDs of users who mutually like each other
      const mutualUserIds = mutualLikes.map((interaction) => interaction.user);

      // Fetch full user details for mutual liked users, excluding the password
      const mutualLikedUsers = await User.find({
        _id: { $in: mutualUserIds },
      }).select("-password");

      return res.status(200).json(mutualLikedUsers);
    } catch (error: any) {
      console.error("Error fetching mutual likes:", error);
      return res.status(500).json({
        message: error.message || "Error fetching mutual likes",
      });
    }
  }

  async unMatchUser(req: Request, res: Response) {
    try {
      const { userId, targetUserId } = req.params;

      // Remove the LIKE interactions between the two users
      await UserInteraction.deleteMany({
        $or: [
          { user: userId, targetUser: targetUserId, type: "LIKE" },
          { user: targetUserId, targetUser: userId, type: "LIKE" },
        ],
      });

      return res.status(200).json({
        message: "Unmatched successful.",
      });
    } catch (error: any) {
      console.error("Error unmatching user:", error);
      return res.status(500).json({
        message: error.message || "Error unmatching user.",
      });
    }
  }

  async blockUser(req: Request, res: Response) {
    const { userId, blockedUserId } = req.params;

    try {
      // Step 1: Update all existing interactions between the two users to "BLOCK"
      await UserInteraction.updateMany(
        {
          $or: [
            { user: userId, targetUser: blockedUserId },
            { user: blockedUserId, targetUser: userId },
          ],
        },
        { $set: { type: "BLOCK" } } // Change all interactions to "BLOCK"
      );

      // Step 2: Remove any existing match records between the two users
      await UserMatch.deleteMany({
        $or: [
          { user1: userId, user2: blockedUserId },
          { user1: blockedUserId, user2: userId },
        ],
      });

      // Step 3: Return success response
      return res.status(200).json({
        message:
          "User blocked successfully. Visibility and interactions have been restricted.",
      });
    } catch (error: any) {
      console.error("Error blocking user:", error);
      return res.status(500).json({
        message: error.message || "Error blocking user.",
      });
    }
  }

  async addImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { url, key } = req.body;

      // Find the document with the specific ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.images.length >= 5) {
        return res
          .status(500)
          .json({ message: "You can only add up to 5 images" });
      }

      // Add the new image to the images array
      user.images.push({ url, key });

      // Save the updated document
      await user.save();

      const userObject = user.toObject();
      const { _id, password: pw, ...rest } = userObject;
      const userPayload = { id: _id, ...rest };

      return res.status(200).json({
        message: "Image added successfully",
        user: userPayload,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Error adding image" });
    }
  }

  async deleteImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { key } = req.body;

      // Find the document with the specific ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if the user has more than one image
      if (user.images.length <= 1) {
        return res
          .status(400)
          .json({ message: "Cannot delete the last image" });
      }

      // Filter out the image that matches the key
      user.images = user.images.filter((image) => image.key !== key);

      // Save the updated document
      await user.save();

      const userObject = user.toObject();
      const { _id, password: pw, ...rest } = userObject;
      const userPayload = { id: _id, ...rest };

      return res.status(200).json({
        message: "Image deleted successfully",
        user: userPayload,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Error deleting image" });
    }
  }

  async updateImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { key, newUrl, newKey } = req.body;

      // Find the document with the specific ID
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find the index of the image to be replaced
      const imageIndex = user.images.findIndex((image) => image.key === key);

      if (imageIndex === -1) {
        return res
          .status(404)
          .json({ message: "Image with the given key not found" });
      }

      // Replace the image URL and key at the specific index
      user.images[imageIndex].url = newUrl;
      user.images[imageIndex].key = newKey;

      // Save the updated document
      await user.save();

      const userObject = user.toObject();
      const { _id, password: pw, ...rest } = userObject;
      const userPayload = { id: _id, ...rest };

      return res.status(200).json({
        message: "Image updated successfully",
        user: userPayload,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Error updating image" });
    }
  }

  async update(req: Request, res: Response) {
    const currentUserId = req.params.id;
    const newData = {
      profilePicture: req.body.profilePicture,
      images: req.body.images,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email.toLowerCase(),
      profilePrivacy: req.body.profilePrivacy,
      isProfileCompleted: req.body.isProfileCompleted,
      //
      questionOne: req.body.questionOne,
      answerOne: req.body.answerOne,
      questionTwo: req.body.questionTwo,
      answerTwo: req.body.answerTwo,
      bio: req.body.bio,
      //
      location: req.body.location,
      likedUsers: req.body.likedUsers,
      premium: {
        isPremium: req.body.premium?.isPremium,
        plan: req.body.premium?.plan,
        expiresIn: req.body.premium?.expiresIn,
      },
      //
      gender: req.body.gender,
      interestedGender: req.body.interestedGender,
      age: req.body.age,
      countryOfOrigin: req.body.countryOfOrigin,
      coordinates: req.body.coordinates,
      currentLocation: req.body.currentLocation,
      maritalStatus: req.body.maritalStatus,
      numberOfChildren: req.body.numberOfChildren,
      height: req.body.height,
      //
      physique: req.body.physique,
      interests: req.body.interests,
      practicedSports: req.body.practicedSports,
      religion: req.body.religion,
      importanceOfReligion: req.body.importanceOfReligion,
      smoking: req.body.smoking,
      //
      educationLevel: req.body.educationLevel,
      occupation: req.body.occupation,
      languages: req.body.languages,
      personality: req.body.personality,
      importantInLife: req.body.importantInLife,
      values: req.body.values,
      //
      wantMarriage: req.body.wantMarriage,
      relationshipEssentials: req.body.relationshipEssentials,
      wantChildren: req.body.wantChildren,
      returnToCountry: req.body.returnToCountry,
      culturalValuesImportance: req.body.culturalValuesImportance,
      partnerFromOtherBackground: req.body.partnerFromOtherBackground,
      partnerFromSameCountry: req.body.partnerFromSameCountry,
      partnerInSameCountry: req.body.partnerInSameCountry,
      //
      shareHouseholdTasks: req.body.shareHouseholdTasks,
      longTermCountries: req.body.longTermCountries,
      //
      partnerAge: {
        minValue: req.body.partnerAge?.minValue,
        maxValue: req.body.partnerAge?.maxValue,
      },
      partnerEducationLevel: req.body.partnerEducationLevel,
      partnerAttraction: req.body.partnerAttraction,
      partnerPhysique: req.body.partnerPhysique,
      partnerSmoking: req.body.partnerSmoking,
      partnerHeight: {
        minValue: req.body.partnerHeight?.minValue,
        maxValue: req.body.partnerHeight?.maxValue,
      },
      //
      status: req.body.status,
    };

    try {
      const existingUser = await User.findById(currentUserId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if any match-relevant fields have changed
      const matchRelevantFields = [
        "gender",
        "interestedGender",
        "age",
        "countryOfOrigin",
        "coordinates",
        "partnerAge",
        "partnerEducationLevel",
        "partnerPhysique",
        "partnerSmoking",
        "partnerHeight",
        "wantMarriage",
        "wantChildren",
        "returnToCountry",
        "educationLevel",
        "smoking",
        "partnerFromSameCountry",
      ];

      const hasRelevantChange = matchRelevantFields.some((field) => {
        const newValue = (newData as Record<string, any>)[field];
        const oldValue = (existingUser as Record<string, any>)[field];

        if (
          typeof newValue === "object" &&
          newValue !== null &&
          oldValue !== null
        ) {
          return JSON.stringify(newValue) !== JSON.stringify(oldValue); // Compare objects safely
        }

        return newValue !== oldValue; // Compare primitive values
      });

      // Update the user and get the updated document
      const updatedUser = await User.findOneAndUpdate(
        { _id: currentUserId },
        { $set: newData },
        { new: true, runValidators: true } // Ensures returned doc is updated and validates changes
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found after update" });
      }

      // Run match calculation **ONLY IF RELEVANT FIELDS CHANGED**
      if (hasRelevantChange) {
        setImmediate(async () => {
          try {
            await updateMatchScores(updatedUser._id.toString());
            console.log(`Scores recomputed for user: ${updatedUser._id}`);
          } catch (error: any) {
            console.error("Error recomputing scores:", error.message);
          }
        });
      } else {
        console.log(
          "No relevant changes detected, skipping match computation."
        );
      }

      // Remove sensitive data before sending response
      const { _id, password, ...userDetails } = updatedUser.toObject();
      res.status(200).json({
        message: "Update successful",
        user: { id: _id, ...userDetails },
      });
    } catch (error: any) {
      console.error("Error during user update:", error.message);
      res.status(500).json({ message: error.message || "Error updating user" });
    }
  }

  async updateCoordinates(req: Request, res: Response) {
    const currentUserId = req.params.id;
    const newData = req.body;

    try {
      const existingUser = await User.findById(currentUserId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const userCoordinates = existingUser.coordinates as {
        type: "Point";
        coordinates: [number, number];
      };

      // Check if only coordinates are sent or if they are sent with other fields
      const isCoordinatesExist = newData.coordinates !== undefined;

      let shouldRecompute = false;

      if (isCoordinatesExist) {
        // If only coordinates are provided, check the distance change
        if (existingUser.coordinates && newData.coordinates) {
          const distance = haversineDistanceCalculator(
            userCoordinates.coordinates[1],
            userCoordinates.coordinates[0],
            newData.coordinates.coordinates[1],
            newData.coordinates.coordinates[0]
          );

          if (distance >= Number(process.env.THRESHOLD_DISTANCE)) {
            shouldRecompute = true;
          }
        }
      }

      // Update the user in the database
      const updateResult = await User.updateOne(
        { _id: currentUserId },
        { $set: newData }
      );
      if (!updateResult.acknowledged) {
        return res.status(400).json({ message: "Update failed" });
      }

      const updatedUser = await User.findById(currentUserId);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found after update" });
      }

      if (shouldRecompute) {
        setImmediate(async () => {
          try {
            await updateMatchScores(currentUserId);
            console.log(`Scores recomputed for user: ${currentUserId}`);
          } catch (error: any) {
            console.error("Error recomputing scores:", error.message);
          }
        });
      }

      const { _id, password, ...userDetails } = updatedUser.toObject();
      return res.status(200).json({
        message: "Update successful",
        user: { id: _id, ...userDetails },
      });
    } catch (error: any) {
      console.error("Error during user update:", error.message);
      return res
        .status(500)
        .json({ message: error.message || "Error updating user coordinates" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const response = await User.deleteOne({ _id: req.params.id });
      if (response.deletedCount > 0) {
        res.status(200).json({
          message: "user deleted",
        });
      } else {
        res.status(404).json({
          message: "user not found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error deleting account",
      });
    }
  }
}

export default UserController;
