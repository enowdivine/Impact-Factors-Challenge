import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Template", TemplateSchema);
