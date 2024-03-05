import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "./admin.model";
import bcrypt from "bcrypt";
import _ from "lodash";

class AdminController {
  async register(req: Request, res: Response) {
    try {
      const admin = await Admin.findOne({ email: req.body.email });
      if (admin) {
        return res.status(409).json({
          message: "admin already exist",
        });
      }
      const hash = await bcrypt.hash(req.body.password, 10);
      const newAdmin = new Admin({
        email: req.body.email,
        password: hash,
      });
      newAdmin
        .save()
        .then((response) => {
          const token: string = jwt.sign(
            {
              id: response._id,
              email: response.email,
            },
            process.env.JWT_SECRET as string
          );
          res.status(201).json({
            message: "admin created",
            token,
          });
        })
        .catch((err) => {
          res.status(500).json({
            message: "error creating admin",
            error: err,
          });
        });
    } catch (error) {
      console.error("error in admin registration", error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const admin = await Admin.findOne({ email: req.body.email });
      if (admin) {
        bcrypt.compare(
          req.body.password,
          admin.password!,
          (err: any, result: any) => {
            if (err) {
              return res.status(401).json({
                message: "Authentication Failed",
              });
            }
            if (result) {
              const token: string = jwt.sign(
                {
                  id: admin._id,
                  email: admin.email,
                },
                process.env.JWT_SECRET as string
              );
              return res.status(200).json({
                message: "Login Successful",
                token: token,
              });
            }
            res.status(401).json({
              message: "Authentication Failed",
            });
          }
        );
      } else {
        return res.status(401).json({
          message: "Authentication Faileds",
        });
      }
    } catch (error) {
      console.error("error in loggin in", error);
    }
  }

  async update(req: Request, res: Response) {
    const admin = await Admin.updateOne(
      {
        _id: req.params.id,
      },
      {
        $set: {
          email: req.body.email,
        },
      }
    );
    if (admin.acknowledged) {
      const newadmin = await Admin.findOne({ _id: req.params.id });
      const token: string = jwt.sign(
        {
          id: newadmin?._id,
          email: newadmin?.email,
        },
        process.env.JWT_SECRET as string
      );
      res.status(200).json({
        message: "update successful",
        token: token,
      });
    } else {
      res.status(404).json({
        message: "admin not found",
      });
    }
  }

  async updatePassword(req: Request, res: Response) {
    let admin = await Admin.findOne({ _id: req.params.id });
    if (admin) {
      const { currentPassword, newPassword } = req.body;
      bcrypt
        .compare(currentPassword, admin.password!)
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

              admin = _.extend(admin, passwordUpdate);
              if (admin) {
                admin
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
}

export default AdminController;
