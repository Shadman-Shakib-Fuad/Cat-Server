import express from "express";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/:lessonId", async (req, res) => {
  try {
    const comments = await Comment.find({ lessonId: req.params.lessonId })
      .populate("userId", "name photoURL")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const comment = await Comment.create({
      lessonId: req.body.lessonId,
      userId: user._id,
      text: req.body.text,
    });
    const populated = await comment.populate("userId", "name photoURL");
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;