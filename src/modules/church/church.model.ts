import mongoose from "mongoose";

const ChurchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    subdomain: { type: String, required: true, unique: true },
    isPublished: { type: Boolean, default: false },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Church", ChurchSchema);
