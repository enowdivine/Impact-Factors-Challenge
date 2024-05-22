import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import bcrypt from "bcrypt";
import _ from "lodash";

class UserController {
  async register(req: Request, res: Response) {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(409).json({
          message: "user already exist",
        });
      }
      const hash = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        role: req.body.role,
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
        password: hash,
        // student details
        studentDetails: {
          amsId: req.body.amsId,
          ordinaryLevelIdentificationNumber:
            req.body.ordinaryLevelIdentificationNumber,
          dateOfBirth: new Date(req.body.dateOfBirth),
          gender: req.body.gender,
          address: req.body.address,
          highSchoolName: req.body.highSchoolName,
          gradesGPA: req.body.gradesGPA,
          documents: req.body.documents,
          authorizationLevel: req.body.authorizationLevel,
        },
        // addmission officers
        admissionOfficerDetails: {
          assignedUniversities: req.body.assignedUniversities,
          authorizationLevel: req.body.authorizationLevel,
        },
        // admin
        administratorDetails: {
          authorizationLevel: req.body.authorizationLevel,
        },
      });
      newUser
        .save()
        .then((response) => {
          const token: string = jwt.sign(
            {
              id: response._id,
              role: req.body.role,
              fullName: req.body.fullName,
              emailAddress: req.body.emailAddress,
              phoneNumber: req.body.phoneNumber,
            },
            process.env.JWT_SECRET as string
          );
          res.status(201).json({
            message: "user created",
            token,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "error creating user",
            error: err,
          });
        });
    } catch (error) {
      console.error("error in user registration", error);
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
                  role: req.body.role,
                  fullName: req.body.fullName,
                  emailAddress: req.body.emailAddress,
                  phoneNumber: req.body.phoneNumber,
                },
                process.env.JWT_SECRET as string
              );

              return res.status(200).json({
                message: "login successful",
                token: token,
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
    } catch (error) {
      console.error("login error", error);
    }
  }

  async update(req: Request, res: Response) {
    const user = await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          role: req.body.role,
          fullName: req.body.fullName,
          emailAddress: req.body.emailAddress,
          phoneNumber: req.body.phoneNumber,
          // student details
          studentDetails: {
            amsId: req.body.amsId,
            ordinaryLevelIdentificationNumber:
              req.body.ordinaryLevelIdentificationNumber,
            dateOfBirth: new Date(req.body.dateOfBirth),
            gender: req.body.gender,
            address: req.body.address,
            highSchoolName: req.body.highSchoolName,
            gradesGPA: req.body.gradesGPA,
            documents: req.body.documents,
            authorizationLevel: 4,
          },
          // addmission officers
          admissionOfficerDetails: {
            assignedUniversities: req.body.assignedUniversities,
            authorizationLevel: 2,
            canGenerateConditionalOffers: true,
            canGenerateFinalOffers: false,
          },
          // admin
          administratorDetails: {
            authorizationLevel: 1,
            canGenerateFinalOffersForAll: true,
          },
        },
      }
    );
    if (user.acknowledged) {
      const newUser = await User.findOne({ _id: req.params.id });
      const token: string = jwt.sign(
        {
          id: newUser?._id,
          role: newUser?.role,
          fullName: newUser?.fullName,
          emailAddress: newUser?.emailAddress,
          phoneNumber: newUser?.phoneNumber,
        },
        process.env.JWT_SECRET as string
      );
      res.status(200).json({
        message: "update successful",
        token: token,
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
                  error: error,
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
                      error: error,
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
            error: err,
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
    } catch (error) {
      console.error("error deleting user", error);
      return res.status(500).json({
        message: "error deleting user",
      });
    }
  }

  async students(req: Request, res: Response) {
    try {
      const students = await User.find({ role: "STUDENT" }).sort({
        createdAt: -1,
      });
      if (students) {
        return res.status(200).json(students);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async adminOfficers(req: Request, res: Response) {
    try {
      const adminOfficers = await User.find({ role: "ADMISSION_OFFICER" }).sort(
        {
          createdAt: -1,
        }
      );
      if (adminOfficers) {
        return res.status(200).json(adminOfficers);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }
}

export default UserController;
