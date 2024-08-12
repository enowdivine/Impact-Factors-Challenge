import { Request, Response } from "express";
import dotenv from "dotenv";
import axios, { AxiosResponse } from "axios";
import Transaction from "./tranzak.model";
import applicationModel from "../applications/data.model";

dotenv.config();

async function generateRandomOrderNumber() {
  const randomNumber = Math.floor(Math.random() * 10000) + 1; // Generates a random number between 1 and 10000
  return `REGISTRATIONFEE${randomNumber}`;
}

class TranzakController {
  async makePayment(req: Request, res: Response) {
    try {
      const txnRef = await generateRandomOrderNumber();

      const data = {
        amount: 5200,
        mobileWalletNumber: 237 + req.body.mobileWalletNumber,
        currencyCode: "XAF",
        description: "This is one time fee needed to process your application.",
        payerNote: "Campus Camer Registration Fee.",
        mchTransactionRef: txnRef,
        receivingAccountId: process.env.TRANZAK_RECEIVING_ACCOUNT_ID,
        receivingEntityName: "Campus Camer",
        // transactionTag: `RegistrationFee${year}${txnRef}`,
        // serviceDiscountAmount: 0,
        // customization: "",
        // payerFeePercentage: "",
        // returnUrl: "",
        // cancelUrl: "",
      };

      const authResponse: AxiosResponse<any> = await axios.post(
        process.env.TRANZAK_AUTH_URL as string,
        {
          appId: process.env.TRANZAK_APPID,
          appKey: process.env.TRANZAK_APPKEY,
        }
      );

      if (!authResponse.data.success) {
        res.status(500).json({
          message: "Failed to obtain authentication token",
        });
      } else {
        const paymentResponse: AxiosResponse<any> = await axios.post(
          process.env.TRAZAK_COLLECTION_URL as string,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${authResponse.data.data.token}`,
            },
          }
        );

        if (paymentResponse.data.success) {
          const updated = await applicationModel.updateOne(
            {
              _id: req.body.applicationId,
            },
            {
              $set: {
                isPaid: true,
              },
            }
          );

          if (updated.acknowledged) {
            const transactionData = new Transaction({
              studentId: req.body.studentId,
              programName: req.body.programName,
              studentName: req.body.studentName,
              applicationId: req.body.applicationId,
              transactionObject: paymentResponse.data.data,
            });

            await transactionData
              .save()
              .then(() => {
                res.status(200).json({
                  message: "Payment Successful",
                });
              })
              .catch((err) => {
                res.status(500).json({
                  message: "an error occured",
                  error: err,
                });
              });
          } else {
            res.status(404).json({
              message: "error updating application",
            });
          }
        } else {
          res.status(500).json({
            message: "Payment Failed",
          });
        }
      }
    } catch (error: any) {
      res.status(500).json({
        message: error.message || "Transaction Failed",
        error,
      });
    }
  }

  async read(req: Request, res: Response) {
    try {
      const data = await Transaction.find().sort({ createdAt: -1 });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "no data found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async readByStudentId(req: Request, res: Response) {
    try {
      const data = await Transaction.find({ studentId: req.params.id }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }

  async readByApplicationId(req: Request, res: Response) {
    try {
      const data = await Transaction.find({
        applicationId: req.params.id,
      }).sort({
        createdAt: -1,
      });
      if (data) {
        return res.status(200).json(data);
      } else {
        return res.status(404).json({
          message: "data not found",
        });
      }
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Error fetching data",
      });
    }
  }
}

export default TranzakController;
