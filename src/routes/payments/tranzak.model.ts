import mongoose, { Schema, Document } from "mongoose";

interface ITransaction extends Document {
  studentId: string;
  studentName: string;
  programName: string;
  applicationId: string;
  transactionObject: object;
}

const transactionSchema: Schema<ITransaction> = new Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    programName: {
      type: String,
      required: true,
    },
    applicationId: {
      type: String,
      required: true,
    },
    transactionObject: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITransaction>("Transaction", transactionSchema);
