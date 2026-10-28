import mongoose from "mongoose";

const { Schema, model } = mongoose;

const visualContentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", trim: true, maxlength: 1800 },
    category: {
      type: String,
      enum: [
        "Earthquake",
        "Flood",
        "Cyclone and storms",
        "Wildfire",
        "Landslide",
        "Extreme heat",
        "Tsunami",
        "Chemical safety",
        "General preparedness",
      ],
      default: "General preparedness",
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["animation", "image", "video"],
      required: true,
      default: "animation",
    },
    mediaUrl: { type: String, required: true, trim: true, maxlength: 2048 },
    altText: { type: String, default: "", trim: true, maxlength: 250 },
    sourceName: { type: String, default: "AtmosWatch", trim: true, maxlength: 120 },
    sourceUrl: { type: String, default: "", trim: true, maxlength: 2048 },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: "Institution", default: null, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

visualContentSchema.index({ status: 1, institutionId: 1, createdAt: -1 });
visualContentSchema.index({ createdBy: 1, updatedAt: -1 });

export const VisualContent =
  mongoose.models.VisualContent || model("VisualContent", visualContentSchema);
