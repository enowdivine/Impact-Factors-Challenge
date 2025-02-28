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
    // fields: [
    //   {
    //     label: { type: String, required: true },
    //     type: {
    //       type: String,
    //       enum: ["text", "email", "date", "checkbox"], // Only the types we use
    //       required: true,
    //     },
    //     placeholder: { type: String, default: "" }, // Optional placeholder
    //   },
    // ],
    submissions: [
      {
        data: { type: Object, required: true }, // Stores form responses
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
