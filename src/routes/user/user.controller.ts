import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import bcrypt from "bcrypt";
import _ from "lodash";
import sendEmail from "../../services/email/email";
import { userSignup } from "./templates/email";

class UserController {
  async register(req: Request, res: Response) {
    try {
      const user = await User.findOne({ emailAddress: req.body.emailAddress });
      if (user) {
        return res.status(409).json({
          message: "user already exist",
        });
      }

      const hash = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: hash,
      });
      newUser
        .save()
        .then((response) => {
          res.status(201).json({
            message: "user created",
          });
        })
        .catch((err: any) => {
          res.status(500).json({
            message: err.message || "error creating user",
            error: err,
          });
        });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "error in user registration",
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        bcrypt.compare(
          req.body.password,
          user.password!,
          (err: any, result: any) => {
            if (err) {
              return res.status(401).json({
                message: "authentication failed",
              });
            }
            if (result) {
              const token: string = jwt.sign(
                {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                },
                process.env.JWT_SECRET as string
              );

              return res.status(200).json({
                message: "login successful",
                token: token,
                data: {
                  id: user._id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  phone: user.phone,
                },
              });
            }
            res.status(401).json({
              message: "authentication failed",
            });
          }
        );
      } else {
        return res.status(401).json({
          message: "authentication failed",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Authentication failed",
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
          phone: req.body.phone,
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
          size: req.body.size,
          //
          physique: req.body.physique,
          interests: req.body.interests,
          practicedSports: req.body.practicedSports,
          religion: req.body.religion,
          importanceOfReligion: req.body.importanceOfReligion,
          drinkAlcohol: req.body.drinkAlcohol,
          smoke: req.body.smoke,
          //
          educationLevel: req.body.educationLevel,
          workSector: req.body.workSector,
          languages: req.body.languages,
          personality: req.body.personality,
          lifeImportance: req.body.lifeImportance,
          values: req.body.values,
          //
          willLikeToGetMarried: req.body.willLikeToGetMarried,
          relationshipEssentials: req.body.relationshipEssentials,
          willLikeToHaveChildren: req.body.willLikeToHaveChildren,
          planOnReturningToMyCountry: req.body.planOnReturningToMyCountry,
          importanceOfValues: req.body.importanceOfValues,
          partnerFromOtherBackground: req.body.partnerFromOtherBackground,
          partnerFromSameCountry: req.body.partnerFromSameCountry,
          partnerInSameCountry: req.body.partnerInSameCountry,
          //
          shareHouseTasks: req.body.shareHouseTasks,
          longTermCountry: req.body.longTermCountry,
          oftenCook: req.body.oftenCook,
          importanceToSexuality: req.body.importanceToSexuality,
          //
          partnerFinancialStability: req.body.partnerFinancialStability,
          partnerAge: {
            minValue: req.body.partnerAge?.minValue,
            maxValue: req.body.partnerAge?.maxValue,
          },
          partnerEducationLevel: req.body.partnerEducationLevel,
          partnerInterest: req.body.partnerInterest,
          partnerCharacteristics: req.body.partnerCharacteristics,
          partnerCanSmoke: req.body.partnerCanSmoke,
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
