import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "./user.model";
import bcrypt from "bcrypt";
import _ from "lodash";
import sendEmail from "../../services/email/email";
import Application from "../applications/data.model";

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
        role: req.body.role,
        image: req.body.image,
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
        authorizationLevel: req.body.authorizationLevel,
        password: hash,
        // student details
        studentDetails: {
          amsId: req.body.studentDetails?.amsId,
          ordinaryLevelIdentificationNumber:
            req.body.studentDetails?.ordinaryLevelIdentificationNumber,
          dateOfBirth: req.body.studentDetails?.dateOfBirth,
          gender: req.body.studentDetails?.gender,
          address: req.body.studentDetails?.address,
          highSchoolName: req.body.studentDetails?.highSchoolName,
          gradesGPA: req.body.studentDetails?.gradesGPA,
          documents: req.body.studentDetails?.documents,
          // guardian details
          guardian: {
            guardianName: req.body.studentDetails?.guardian?.guardianName,
            guardianEmail: req.body.studentDetails?.guardian?.guardianEmail,
            guardianPhone: req.body.studentDetails?.guardian?.guardianPhone,
            guardianAge: req.body.studentDetails?.guardian?.guardianAge,
            guardianAddress: req.body.studentDetails?.guardian?.guardianAddress,
          },
        },
        // addmission officers
        admissionOfficerDetails: {
          assignedUniversities:
            req.body.admissionOfficerDetails?.assignedUniversities,
        },
      });
      newUser
        .save()
        .then((response) => {
          sendEmail({
            to: req.body.emailAddress,
            subject: req.body.subject,
            message: "",
            title: "",
          });

          res.status(201).json({
            message: "user created",
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
      const user = await User.findOne({ emailAddress: req.body.emailAddress });
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
                  role: user.role,
                  fullName: user.fullName,
                  emailAddress: user.emailAddress,
                  phoneNumber: user.phoneNumber,
                  authorizationLevel: user.authorizationLevel,
                  assignedUniversities:
                    user.admissionOfficerDetails?.assignedUniversities,
                },
                process.env.JWT_SECRET as string
              );

              return res.status(200).json({
                message: "login successful",
                token: token,
                data: {
                  role: user.role,
                  fullName: user.fullName,
                  emailAddress: user.emailAddress,
                  phoneNumber: user.phoneNumber,
                  authorizationLevel: user.authorizationLevel,
                  studentDetails: {
                    amsId: user.studentDetails?.amsId,
                    ordinaryLevelIdentificationNumber:
                      user.studentDetails?.ordinaryLevelIdentificationNumber,
                    dateOfBirth: user.studentDetails?.dateOfBirth,
                    gender: user.studentDetails?.gender,
                    address: user.studentDetails?.address,
                    highSchoolName: user.studentDetails?.highSchoolName,
                    gradesGPA: user.studentDetails?.gradesGPA,
                    documents: user.studentDetails?.documents,
                  },
                  admissionOfficerDetails: {
                    assignedUniversities:
                      user.admissionOfficerDetails?.assignedUniversities,
                  },
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
    } catch (error) {
      console.error("login error", error);
    }
  }

  async update(req: Request, res: Response) {
    const applicationUpdate = await Application.updateOne(
      {
        studentId: req.params.id,
      },
      {
        $set: {
          studentName: req.body.fullName,
        },
      }
    );
    const user = await User.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          role: req.body.role,
          image: req.body.image,
          fullName: req.body.fullName,
          emailAddress: req.body.emailAddress,
          phoneNumber: req.body.phoneNumber,
          authorizationLevel: req.body.authorizationLevel,
          password:
            req.body.password && (await bcrypt.hash(req.body.password, 10)),
          // student details
          studentDetails: {
            amsId: req.body.studentDetails?.amsId,
            ordinaryLevelIdentificationNumber:
              req.body.studentDetails?.ordinaryLevelIdentificationNumber,
            dateOfBirth: req.body.studentDetails?.dateOfBirth,
            gender: req.body.studentDetails?.gender,
            address: req.body.studentDetails?.address,
            highSchoolName: req.body.studentDetails?.highSchoolName,
            gradesGPA: req.body.studentDetails?.gradesGPA,
            documents: req.body.studentDetails?.documents,
            // guardian details
            guardian: {
              guardianName: req.body.studentDetails?.guardian?.guardianName,
              guardianEmail: req.body.studentDetails?.guardian?.guardianEmail,
              guardianPhone: req.body.studentDetails?.guardian?.guardianPhone,
              guardianAge: req.body.studentDetails?.guardian?.guardianAge,
              guardianAddress:
                req.body.studentDetails?.guardian?.guardianAddress,
            },
          },
          // addmission officers
          admissionOfficerDetails: {
            assignedUniversities:
              req.body.admissionOfficerDetails?.assignedUniversities,
          },
        },
      }
    );
    if (applicationUpdate.acknowledged && user.acknowledged) {
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
    } catch (error) {
      console.error("error fetching data", error);
      return res.status(500).json({
        message: "error fetching data",
      });
    }
  }

  async students(req: Request, res: Response) {
    try {
      const data = await User.find({ role: "STUDENT" }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
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
      const data = await User.find({
        role: { $in: ["ADMISSION_OFFICER", "AECO_ADMIN"] },
      }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
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
