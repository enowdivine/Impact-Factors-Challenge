import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import bcrypt from "bcrypt";
import _ from "lodash";
import crypto from "crypto"; // Import crypto to seed randomness

import sendEmail from "../../services/email/email";
import { userSignup } from "./templates/email";
import { generateToken } from "../streamChat/stream.controller";

// ALGORITHM IMPORTS
import { getFilteredUsers } from "../algorithm/algm.combinedFilters";

const verificationCodes = new Map();
const generateVerificationCode = () =>
  Math.floor(100000 + Math.random() * 900000);

class UserController {
  async register(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(409).json({
          message: "User already exist",
        });
      }

      const hash = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        password: hash,
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
          const verificationCode = generateVerificationCode();
          verificationCodes.set(req.body.email, verificationCode);

          // Send verification code via email
          sendEmail({
            to: req.body.email,
            title: "Welcome To Bliss Dating",
            subject: "Verify Your Email",
            message: userSignup(req.body.firstName, verificationCode),
          });

          return res.status(201).json({
            message: "user created",
            token: token,
            streamToken: streamResult.token,
            user: {
              id: response._id,
              role: response.role,
              profilePicture: response.profilePicture,
              images: response.images,
              firstName: response.firstName,
              lastName: response.lastName,
              username: response.username,
              email: response.email,
              emailVerified: response.emailVerified,
              profilePrivacy: response.profilePrivacy,
              isProfileCompleted: response.isProfileCompleted,
              //
              questionOne: response.questionOne,
              answerOne: response.answerOne,
              questionTwo: response.questionTwo,
              answerTwo: response.answerTwo,
              bio: response.bio,
              //
              location: response.location,
              likedUsers: response.likedUsers,
              premium: response.premium,
              //
              gender: response.gender,
              interestedGender: response.interestedGender,
              age: response.age,
              countryOfOrigin: response.countryOfOrigin,
              currentLocation: response.currentLocation,
              maritalStatus: response.maritalStatus,
              numberOfChildren: response.numberOfChildren,
              height: response.height,
              //
              physique: response.physique,
              interests: response.interests,
              practicedSports: response.practicedSports,
              religion: response.religion,
              importanceOfReligion: response.importanceOfReligion,
              smoking: response.smoking,
              //
              educationLevel: response.educationLevel,
              occupation: response.occupation,
              languages: response.languages,
              personality: response.personality,
              importantInLife: response.importantInLife,
              values: response.values,
              //
              wantMarriage: response.wantMarriage,
              relationshipEssentials: response.relationshipEssentials,
              wantChildren: response.wantChildren,
              returnToCountry: response.returnToCountry,
              culturalValuesImportance: response.culturalValuesImportance,
              partnerFromOtherBackground: response.partnerFromOtherBackground,
              partnerFromSameCountry: response.partnerFromSameCountry,
              partnerInSameCountry: response.partnerInSameCountry,
              //
              shareHouseholdTasks: response.shareHouseholdTasks,
              longTermCountries: response.longTermCountries,
              //
              partnerAge: response.partnerAge,
              partnerEducationLevel: response.partnerEducationLevel,
              partnerAttraction: response.partnerAttraction,
              partnerPhysique: response.partnerPhysique,
              partnerSmoking: response.partnerSmoking,
              partnerHeight: response.partnerHeight,
              //
              status: response.status,
              //
              createdAt: response.createdAt,
              updatedAt: response.updatedAt,
            },
          });
        })
        .catch((err: any) => {
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
      const storedCode = verificationCodes.get(req.body.email); // Retrieve the stored code

      if (!storedCode) {
        return res.status(400).json({ message: "Invalid verification code" });
      }

      if (parseInt(req.body.code) !== storedCode) {
        return res.status(400).json({ message: "Invalid verification code." });
      }

      // Mark the user as verified
      const user = await User.findOneAndUpdate(
        { email: req.body.email },
        { emailVerified: true }
      );

      if (user) {
        verificationCodes.delete(req.body.email);
        return res
          .status(200)
          .json({ message: "Email verified successfully!" });
      } else {
        return res.status(404).json({ message: "User not found." });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error in user registration",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email.toLowerCase() });

      if (user) {
        if (!user?.emailVerified) {
          // return res.status(500).json({
          //   message:
          //     "Email not verified. Please verify your email to continue.",
          // });
          // Generate the six-digit verification code
          const verificationCode = generateVerificationCode();
          verificationCodes.set(req.body.email, verificationCode);

          // Send verification code via email
          sendEmail({
            to: req.body.email,
            title: "Email verification code",
            subject: "Verify Your Email",
            message: userSignup(user.firstName, verificationCode),
          });

          return res.status(200).json({
            message: "Success",
            user: {
              id: user._id,
              role: user.role,
              profilePicture: user.profilePicture,
              images: user.images,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              email: user.email,
              emailVerified: user.emailVerified,
              profilePrivacy: user.profilePrivacy,
              isProfileCompleted: user.isProfileCompleted,
              //
              questionOne: user.questionOne,
              answerOne: user.answerOne,
              questionTwo: user.questionTwo,
              answerTwo: user.answerTwo,
              bio: user.bio,
              //
              location: user.location,
              likedUsers: user.likedUsers,
              premium: user.premium,
              //
              gender: user.gender,
              interestedGender: user.interestedGender,
              age: user.age,
              countryOfOrigin: user.countryOfOrigin,
              currentLocation: user.currentLocation,
              maritalStatus: user.maritalStatus,
              numberOfChildren: user.numberOfChildren,
              height: user.height,
              //
              physique: user.physique,
              interests: user.interests,
              practicedSports: user.practicedSports,
              religion: user.religion,
              importanceOfReligion: user.importanceOfReligion,
              smoking: user.smoking,
              //
              educationLevel: user.educationLevel,
              occupation: user.occupation,
              languages: user.languages,
              personality: user.personality,
              importantInLife: user.importantInLife,
              values: user.values,
              //
              wantMarriage: user.wantMarriage,
              relationshipEssentials: user.relationshipEssentials,
              wantChildren: user.wantChildren,
              returnToCountry: user.returnToCountry,
              culturalValuesImportance: user.culturalValuesImportance,
              partnerFromOtherBackground: user.partnerFromOtherBackground,
              partnerFromSameCountry: user.partnerFromSameCountry,
              partnerInSameCountry: user.partnerInSameCountry,
              //
              shareHouseholdTasks: user.shareHouseholdTasks,
              longTermCountries: user.longTermCountries,
              //
              partnerAge: user.partnerAge,
              partnerEducationLevel: user.partnerEducationLevel,
              partnerAttraction: user.partnerAttraction,
              partnerPhysique: user.partnerPhysique,
              partnerSmoking: user.partnerSmoking,
              partnerHeight: user.partnerHeight,
              //
              status: user.status,
              //
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
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

              return res.status(200).json({
                message: "Login successful",
                token: token,
                streamToken: streamResult.token,
                user: {
                  id: user._id,
                  role: user.role,
                  profilePicture: user.profilePicture,
                  images: user.images,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  username: user.username,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  profilePrivacy: user.profilePrivacy,
                  isProfileCompleted: user.isProfileCompleted,
                  //
                  questionOne: user.questionOne,
                  answerOne: user.answerOne,
                  questionTwo: user.questionTwo,
                  answerTwo: user.answerTwo,
                  bio: user.bio,
                  //
                  location: user.location,
                  likedUsers: user.likedUsers,
                  premium: user.premium,
                  //
                  gender: user.gender,
                  interestedGender: user.interestedGender,
                  age: user.age,
                  countryOfOrigin: user.countryOfOrigin,
                  currentLocation: user.currentLocation,
                  maritalStatus: user.maritalStatus,
                  numberOfChildren: user.numberOfChildren,
                  height: user.height,
                  //
                  physique: user.physique,
                  interests: user.interests,
                  practicedSports: user.practicedSports,
                  religion: user.religion,
                  importanceOfReligion: user.importanceOfReligion,
                  smoking: user.smoking,
                  //
                  educationLevel: user.educationLevel,
                  occupation: user.occupation,
                  languages: user.languages,
                  personality: user.personality,
                  importantInLife: user.importantInLife,
                  values: user.values,
                  //
                  wantMarriage: user.wantMarriage,
                  relationshipEssentials: user.relationshipEssentials,
                  wantChildren: user.wantChildren,
                  returnToCountry: user.returnToCountry,
                  culturalValuesImportance: user.culturalValuesImportance,
                  partnerFromOtherBackground: user.partnerFromOtherBackground,
                  partnerFromSameCountry: user.partnerFromSameCountry,
                  partnerInSameCountry: user.partnerInSameCountry,
                  //
                  shareHouseholdTasks: user.shareHouseholdTasks,
                  longTermCountries: user.longTermCountries,
                  //
                  partnerAge: user.partnerAge,
                  partnerEducationLevel: user.partnerEducationLevel,
                  partnerAttraction: user.partnerAttraction,
                  partnerPhysique: user.partnerPhysique,
                  partnerSmoking: user.partnerSmoking,
                  partnerHeight: user.partnerHeight,
                  //
                  status: user.status,
                  //
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                },
              });
            }
          }
        );
      } else {
        return res.status(401).json({
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
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(409).json({
          message: "User does not exist. Check your email address.",
        });
      } else {
        // Generate the six-digit verification code
        const verificationCode = generateVerificationCode();
        verificationCodes.set(req.body.email, verificationCode);

        // Send verification code via email
        sendEmail({
          to: req.body.email,
          title: "Email verification code",
          subject: "Verify Your Email",
          message: userSignup(user.firstName, verificationCode),
        });

        res.status(201).json({
          message: "User created",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error in generating code",
      });
    }
  }

  async emailVerification(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        res.status(409).json({
          message: "User does not exist. Check your email address.",
        });
      } else {
        // Generate the six-digit verification code
        const verificationCode = generateVerificationCode();
        verificationCodes.set(req.body.email, verificationCode);

        // Send verification code via email
        sendEmail({
          to: req.body.email,
          title: "Email verification code",
          subject: "Verify Your Email",
          message: userSignup(user.firstName, verificationCode),
        });

        res.status(201).json({
          message: "User created",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Error in generating code",
      });
    }
  }

  async newPassword(req: Request, res: Response) {
    try {
      let user = await User.findOne({ email: req.body.email });
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
      const data = await User.findOne({ _id: req.params.id });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error fetching data",
      });
    }
  }

  async users(req: Request, res: Response) {
    try {
      const currentUserId = req.params.id;

      // Default values for page and limit if not provided in the query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Calculate the starting index for the query based on page and limit
      const skip = (page - 1) * limit;

      // Step 1: Get all filtered users
      let users = await getFilteredUsers(currentUserId);

      // Step 2: Implement pagination on the filtered users
      const totalUsers = users.length; // Total number of filtered users
      const paginatedUsers = users.slice(skip, skip + limit); // Slice the array to get the paginated results

      // Step 3: Return the paginated users
      return res.status(200).json({
        users: paginatedUsers,
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

  async twoBestMatches(req: Request, res: Response) {
    try {
      // Get the user ID of the person making the request
      const requestingUserId = req.params.id;

      // Get all users with the role "USER"
      const allUsers = await User.find({
        role: "USER",
        _id: { $ne: requestingUserId }, // Exclude the requesting user
      });

      if (allUsers.length === 0) {
        return res.status(404).json({
          message: "No users found",
        });
      }

      // Get the current date as a string (e.g., '2023-09-20')
      const currentDate = new Date().toISOString().split("T")[0];

      // Use the current date to create a consistent seed for randomness
      const seed = crypto
        .createHash("sha256")
        .update(currentDate)
        .digest("hex");

      // Convert the seed into a number to use for seeding random
      const seedNumber = parseInt(seed.slice(0, 8), 16);

      // Function to seed the random selection process
      function seededRandom(seed: number) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      }

      // Shuffle users using the seeded randomness
      const shuffledUsers = allUsers
        .map((user) => ({ user, sort: seededRandom(seedNumber) }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ user }) => user);

      // Select only the first two random users
      const selectedUsers = shuffledUsers.slice(0, 2);

      return res.status(200).json(selectedUsers);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async toggleLikeUser(req: Request, res: Response) {
    try {
      const { userId } = req.params; // ID of the user performing the like/unlike
      const { likedUserId } = req.params; // ID of the user to be liked/unliked

      if (!userId || !likedUserId) {
        return res
          .status(400)
          .json({ message: "Both userId and likedUserId are required." });
      }

      // Find the user who is performing the like/unlike
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if the likedUserId already exists in the likedUsers array
      const isLiked = user.likedUsers.includes(likedUserId);

      // Toggle logic: If already liked, remove from likedUsers. If not liked, add to likedUsers.
      const update = isLiked
        ? { $pull: { likedUsers: likedUserId } } // Remove likedUserId
        : { $addToSet: { likedUsers: likedUserId } }; // Add likedUserId

      // Update the user document
      const updatedUser = await User.findByIdAndUpdate(userId, update, {
        new: true,
      }).select("likedUsers");

      // If for some reason update failed, return error
      if (!updatedUser) {
        return res.status(500).json({ message: "Error updating like status." });
      }

      // Return the updated likedUsers list
      return res.status(200).json({
        message: isLiked
          ? "User unliked successfully."
          : "User liked successfully.",
        likedUsers: updatedUser.likedUsers, // Return the updated likedUsers array
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error toggling like/unlike status.",
      });
    }
  }

  async likedUsers(req: Request, res: Response) {
    try {
      const data = await User.find({ _id: req.params.id }).populate(
        "likedUsers"
      );
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error fetching data",
      });
    }
  }

  async likedMeUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id; // the ID of the current user
      const data = await User.find({ likedUsers: { $in: [userId] } });
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async mutualLikedUsers(req: Request, res: Response) {
    try {
      const userId = req.params.id; // ID of the current user

      // Find the current user to get the list of users they like
      const currentUser = await User.findById(userId);

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const likedUsersByMe = currentUser.likedUsers; // List of users liked by the current user

      // Find users who like the current user and are also liked by the current user
      const mutualLikes = await User.find({
        _id: { $in: likedUsersByMe }, // Only consider users liked by the current user
        likedUsers: { $in: [userId] }, // Who also like the current user
      });

      return res.status(200).json(mutualLikes);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
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

      return res.status(200).json({
        message: "Image added successfully",
        user: {
          id: user._id,
          role: user.role,
          profilePicture: user.profilePicture,
          images: user.images,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePrivacy: user.profilePrivacy,
          isProfileCompleted: user.isProfileCompleted,
          //
          questionOne: user.questionOne,
          answerOne: user.answerOne,
          questionTwo: user.questionTwo,
          answerTwo: user.answerTwo,
          bio: user.bio,
          //
          location: user.location,
          likedUsers: user.likedUsers,
          premium: user.premium,
          //
          gender: user.gender,
          interestedGender: user.interestedGender,
          age: user.age,
          countryOfOrigin: user.countryOfOrigin,
          currentLocation: user.currentLocation,
          maritalStatus: user.maritalStatus,
          numberOfChildren: user.numberOfChildren,
          height: user.height,
          //
          physique: user.physique,
          interests: user.interests,
          practicedSports: user.practicedSports,
          religion: user.religion,
          importanceOfReligion: user.importanceOfReligion,
          smoking: user.smoking,
          //
          educationLevel: user.educationLevel,
          occupation: user.occupation,
          languages: user.languages,
          personality: user.personality,
          importantInLife: user.importantInLife,
          values: user.values,
          //
          wantMarriage: user.wantMarriage,
          relationshipEssentials: user.relationshipEssentials,
          wantChildren: user.wantChildren,
          returnToCountry: user.returnToCountry,
          culturalValuesImportance: user.culturalValuesImportance,
          partnerFromOtherBackground: user.partnerFromOtherBackground,
          partnerFromSameCountry: user.partnerFromSameCountry,
          partnerInSameCountry: user.partnerInSameCountry,
          //
          shareHouseholdTasks: user.shareHouseholdTasks,
          longTermCountries: user.longTermCountries,
          //
          partnerAge: user.partnerAge,
          partnerEducationLevel: user.partnerEducationLevel,
          partnerAttraction: user.partnerAttraction,
          partnerPhysique: user.partnerPhysique,
          partnerSmoking: user.partnerSmoking,
          partnerHeight: user.partnerHeight,
          //
          status: user.status,
          //
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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

      return res.status(200).json({
        message: "Image deleted successfully",
        user: {
          id: user._id,
          role: user.role,
          profilePicture: user.profilePicture,
          images: user.images,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePrivacy: user.profilePrivacy,
          isProfileCompleted: user.isProfileCompleted,
          //
          questionOne: user.questionOne,
          answerOne: user.answerOne,
          questionTwo: user.questionTwo,
          answerTwo: user.answerTwo,
          bio: user.bio,
          //
          location: user.location,
          likedUsers: user.likedUsers,
          premium: user.premium,
          //
          gender: user.gender,
          interestedGender: user.interestedGender,
          age: user.age,
          countryOfOrigin: user.countryOfOrigin,
          currentLocation: user.currentLocation,
          maritalStatus: user.maritalStatus,
          numberOfChildren: user.numberOfChildren,
          height: user.height,
          //
          physique: user.physique,
          interests: user.interests,
          practicedSports: user.practicedSports,
          religion: user.religion,
          importanceOfReligion: user.importanceOfReligion,
          smoking: user.smoking,
          //
          educationLevel: user.educationLevel,
          occupation: user.occupation,
          languages: user.languages,
          personality: user.personality,
          importantInLife: user.importantInLife,
          values: user.values,
          //
          wantMarriage: user.wantMarriage,
          relationshipEssentials: user.relationshipEssentials,
          wantChildren: user.wantChildren,
          returnToCountry: user.returnToCountry,
          culturalValuesImportance: user.culturalValuesImportance,
          partnerFromOtherBackground: user.partnerFromOtherBackground,
          partnerFromSameCountry: user.partnerFromSameCountry,
          partnerInSameCountry: user.partnerInSameCountry,
          //
          shareHouseholdTasks: user.shareHouseholdTasks,
          longTermCountries: user.longTermCountries,
          //
          partnerAge: user.partnerAge,
          partnerEducationLevel: user.partnerEducationLevel,
          partnerAttraction: user.partnerAttraction,
          partnerPhysique: user.partnerPhysique,
          partnerSmoking: user.partnerSmoking,
          partnerHeight: user.partnerHeight,
          //
          status: user.status,
          //
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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

      return res.status(200).json({
        message: "Image updated successfully",
        user: {
          id: user._id,
          role: user.role,
          profilePicture: user.profilePicture,
          images: user.images,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified,
          profilePrivacy: user.profilePrivacy,
          isProfileCompleted: user.isProfileCompleted,
          //
          questionOne: user.questionOne,
          answerOne: user.answerOne,
          questionTwo: user.questionTwo,
          answerTwo: user.answerTwo,
          bio: user.bio,
          //
          location: user.location,
          likedUsers: user.likedUsers,
          premium: user.premium,
          //
          gender: user.gender,
          interestedGender: user.interestedGender,
          age: user.age,
          countryOfOrigin: user.countryOfOrigin,
          currentLocation: user.currentLocation,
          maritalStatus: user.maritalStatus,
          numberOfChildren: user.numberOfChildren,
          height: user.height,
          //
          physique: user.physique,
          interests: user.interests,
          practicedSports: user.practicedSports,
          religion: user.religion,
          importanceOfReligion: user.importanceOfReligion,
          smoking: user.smoking,
          //
          educationLevel: user.educationLevel,
          occupation: user.occupation,
          languages: user.languages,
          personality: user.personality,
          importantInLife: user.importantInLife,
          values: user.values,
          //
          wantMarriage: user.wantMarriage,
          relationshipEssentials: user.relationshipEssentials,
          wantChildren: user.wantChildren,
          returnToCountry: user.returnToCountry,
          culturalValuesImportance: user.culturalValuesImportance,
          partnerFromOtherBackground: user.partnerFromOtherBackground,
          partnerFromSameCountry: user.partnerFromSameCountry,
          partnerInSameCountry: user.partnerInSameCountry,
          //
          shareHouseholdTasks: user.shareHouseholdTasks,
          longTermCountries: user.longTermCountries,
          //
          partnerAge: user.partnerAge,
          partnerEducationLevel: user.partnerEducationLevel,
          partnerAttraction: user.partnerAttraction,
          partnerPhysique: user.partnerPhysique,
          partnerSmoking: user.partnerSmoking,
          partnerHeight: user.partnerHeight,
          //
          status: user.status,
          //
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Error updating image" });
    }
  }

  async update(req: Request, res: Response) {
    const user = await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          profilePicture: req.body.profilePicture,
          images: req.body.images,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          email: req.body.email,
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
          //
          status: req.body.status,
        },
      }
    );
    if (user.acknowledged) {
      const data = await User.findOne({ _id: req.params.id });
      if (data) {
        res.status(200).json({
          message: "update successful",
          user: {
            id: data._id,
            role: data.role,
            profilePicture: data.profilePicture,
            images: data.images,
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            email: data.email,
            emailVerified: data.emailVerified,
            profilePrivacy: data.profilePrivacy,
            isProfileCompleted: data.isProfileCompleted,
            //
            questionOne: data.questionOne,
            answerOne: data.answerOne,
            questionTwo: data.questionTwo,
            answerTwo: data.answerTwo,
            bio: data.bio,
            //
            location: data.location,
            likedUsers: data.likedUsers,
            premium: data.premium,
            //
            gender: data.gender,
            interestedGender: data.interestedGender,
            age: data.age,
            countryOfOrigin: data.countryOfOrigin,
            currentLocation: data.currentLocation,
            maritalStatus: data.maritalStatus,
            numberOfChildren: data.numberOfChildren,
            height: data.height,
            //
            physique: data.physique,
            interests: data.interests,
            practicedSports: data.practicedSports,
            religion: data.religion,
            importanceOfReligion: data.importanceOfReligion,
            smoking: data.smoking,
            //
            educationLevel: data.educationLevel,
            occupation: data.occupation,
            languages: data.languages,
            personality: data.personality,
            importantInLife: data.importantInLife,
            values: data.values,
            //
            wantMarriage: data.wantMarriage,
            relationshipEssentials: data.relationshipEssentials,
            wantChildren: data.wantChildren,
            returnToCountry: data.returnToCountry,
            culturalValuesImportance: data.culturalValuesImportance,
            partnerFromOtherBackground: data.partnerFromOtherBackground,
            partnerFromSameCountry: data.partnerFromSameCountry,
            partnerInSameCountry: data.partnerInSameCountry,
            //
            shareHouseholdTasks: data.shareHouseholdTasks,
            longTermCountries: data.longTermCountries,
            //
            partnerAge: data.partnerAge,
            partnerEducationLevel: data.partnerEducationLevel,
            partnerAttraction: data.partnerAttraction,
            partnerPhysique: data.partnerPhysique,
            partnerSmoking: data.partnerSmoking,
            partnerHeight: data.partnerHeight,
            //
            status: data.status,
            //
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          },
        });
      }
    } else {
      res.status(404).json({
        message: "user not found",
      });
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
