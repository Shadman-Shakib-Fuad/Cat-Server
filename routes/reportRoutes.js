import express from "express";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("lessonId", "title")
      .populate("reporterUserId", "name email")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const report = await Report.create({
      lessonId: req.body.lessonId,
      reporterUserId: user._id,
      reportedUserEmail: req.user.email,
      reason: req.body.reason,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:lessonId/ignore", verifyAdmin, async (req, res) => {
  try {
    await Report.deleteMany({ lessonId: req.params.lessonId });
    res.json({ message: "Reports cleared" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;