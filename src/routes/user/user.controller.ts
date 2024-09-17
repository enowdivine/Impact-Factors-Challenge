import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import bcrypt from "bcrypt";
import _ from "lodash";
import sendEmail from "../../services/email/email";
import { userSignup } from "./templates/email";

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
        email: req.body.email,
        password: hash,
      });
      newUser
        .save()
        .then((response) => {
          const token: string = jwt.sign(
            {
              id: response._id,
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
            },
            process.env.JWT_SECRET as string
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
            user: {
              id: response._id,
              role: response.role,
              picture: response.picture,
              firstName: response.firstName,
              lastName: response.lastName,
              email: response.email,
              emailVerified: response.emailVerified,
              location: response.location,
              likedUsers: response.likedUsers,
              premium: response.premium,
              gender: response.gender,
              interestedGender: response.interestedGender,
              age: response.age,
              countryOfOrigin: response.countryOfOrigin,
              currentCountry: response.currentCountry,
              maritalStatus: response.maritalStatus,
              numberOfChildren: response.numberOfChildren,
              height: response.height,
              physique: response.physique,
              interests: response.interests,
              practicedSports: response.practicedSports,
              religion: response.religion,
              importanceOfReligion: response.importanceOfReligion,
              smoking: response.smoking,
              educationLevel: response.educationLevel,
              occupation: response.occupation,
              languages: response.languages,
              personality: response.personality,
              importantInLife: response.importantInLife,
              values: response.values,
              wantMarriage: response.wantMarriage,
              relationshipEssentials: response.relationshipEssentials,
              wantChildren: response.wantChildren,
              returnToCountry: response.returnToCountry,
              culturalValuesImportance: response.culturalValuesImportance,
              partnerFromOtherBackground: response.partnerFromOtherBackground,
              partnerFromSameCountry: response.partnerFromSameCountry,
              partnerInSameCountry: response.partnerInSameCountry,
              shareHouseholdTasks: response.shareHouseholdTasks,
              longTermCountries: response.longTermCountries,
              partnerAge: response.partnerAge,
              partnerEducationLevel: response.partnerEducationLevel,
              partnerAttraction: response.partnerAttraction,
              partnerPhysique: response.partnerPhysique,
              partnerSmoking: response.partnerSmoking,
              partnerHeight: response.partnerHeight,
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
        { emailVerified: true },
        { new: true }
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
      const user = await User.findOne({ email: req.body.email });
      if (user?.emailVerified) {
        return res.status(500).json({
          message: "Email not verified. Please verify your email to continue.",
        });
      }

      if (user) {
        bcrypt.compare(
          req.body.password,
          user.password!,
          (err: any, result: any) => {
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

              return res.status(200).json({
                message: "Login successful",
                token: token,
                user: {
                  id: user._id,
                  role: user.role,
                  picture: user.picture,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  location: user.location,
                  likedUsers: user.likedUsers,
                  premium: user.premium,
                  gender: user.gender,
                  interestedGender: user.interestedGender,
                  age: user.age,
                  countryOfOrigin: user.countryOfOrigin,
                  currentCountry: user.currentCountry,
                  maritalStatus: user.maritalStatus,
                  numberOfChildren: user.numberOfChildren,
                  height: user.height,
                  physique: user.physique,
                  interests: user.interests,
                  practicedSports: user.practicedSports,
                  religion: user.religion,
                  importanceOfReligion: user.importanceOfReligion,
                  smoking: user.smoking,
                  educationLevel: user.educationLevel,
                  occupation: user.occupation,
                  languages: user.languages,
                  personality: user.personality,
                  importantInLife: user.importantInLife,
                  values: user.values,
                  wantMarriage: user.wantMarriage,
                  relationshipEssentials: user.relationshipEssentials,
                  wantChildren: user.wantChildren,
                  returnToCountry: user.returnToCountry,
                  culturalValuesImportance: user.culturalValuesImportance,
                  partnerFromOtherBackground: user.partnerFromOtherBackground,
                  partnerFromSameCountry: user.partnerFromSameCountry,
                  partnerInSameCountry: user.partnerInSameCountry,
                  shareHouseholdTasks: user.shareHouseholdTasks,
                  longTermCountries: user.longTermCountries,
                  partnerAge: user.partnerAge,
                  partnerEducationLevel: user.partnerEducationLevel,
                  partnerAttraction: user.partnerAttraction,
                  partnerPhysique: user.partnerPhysique,
                  partnerSmoking: user.partnerSmoking,
                  partnerHeight: user.partnerHeight,
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
      const data = await User.findOne({ role: "USER" }).sort({
        createdAt: -1,
      });
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

  async update(req: Request, res: Response) {
    const user = await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          picture: req.body.picture,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          profilePrivacy: req.body.profilePrivacy,
          //
          questionOne: req.body.questionOne,
          answerOne: req.body.answerOne,
          questionTwo: req.body.questionTwo,
          answerTwo: req.body.answerTwo,
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
          currentCountry: req.body.currentCountry,
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
        },
      }
    );
    if (user.acknowledged) {
      const data = await User.findOne({ _id: req.params.id });
      res.status(200).json({
        message: "update successful",
        data,
      });
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
        message: error.message || "error deleting user",
      });
    }
  }
}

export default UserController;
