import mongoose from "mongoose";

const FormSchema = new mongoose.Schema(
  {
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: true,
    },
    name: { type: String, required: true },
    fields: { type: Array, required: true }, // Example: [{ label: "Name", type: "text" }, { label: "Email", type: "email" }]
  },
  { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
