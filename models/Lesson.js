import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["Personal Growth", "Career", "Relationships", "Mindset", "Mistakes Learned"],
      required: true,
    },
    emotionalTone: {
      type: String,
      enum: ["Motivational", "Sad", "Realization", "Gratitude"],
      required: true,
    },
    visibility: { type: String, enum: ["Public", "Private"], default: "Public" },
    accessLevel: { type: String, enum: ["Free", "Premium"], default: "Free" },
    image: { type: String, default: "" },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    favoritesCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Lesson", lessonSchema);