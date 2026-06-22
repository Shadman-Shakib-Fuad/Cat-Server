import express from "express";
import Favorite from "../models/Favorite.js";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const favorites = await Favorite.find({ userId: user._id }).populate({
      path: "lessonId",
      populate: { path: "creatorId", select: "name photoURL" },
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const existing = await Favorite.findOne({ userId: user._id, lessonId: req.body.lessonId });
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      await Lesson.findByIdAndUpdate(req.body.lessonId, { $inc: { favoritesCount: -1 } });
      return res.json({ saved: false });
    }
    await Favorite.create({ userId: user._id, lessonId: req.body.lessonId });
    await Lesson.findByIdAndUpdate(req.body.lessonId, { $inc: { favoritesCount: 1 } });
    res.json({ saved: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;