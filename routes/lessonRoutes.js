import express from "express";
import Lesson from "../models/Lesson.js";
import User from "../models/User.js";
import { verifyToken, verifyAdmin } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, emotionalTone, search, sort, page = 1, limit = 6 } = req.query;

    const filter = { visibility: "Public" };
    if (category && category !== "All") filter.category = category;
    if (emotionalTone && emotionalTone !== "All") filter.emotionalTone = emotionalTone;
    if (search) filter.title = { $regex: search, $options: "i" };

    const sortOption = sort === "mostSaved" ? { favoritesCount: -1 } : { createdAt: -1 };

    const total = await Lesson.countDocuments(filter);
    const lessons = await Lesson.find(filter)
      .populate("creatorId", "name photoURL")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ lessons, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/featured", async (req, res) => {
  try {
    const lessons = await Lesson.find({ isFeatured: true, visibility: "Public" })
      .populate("creatorId", "name photoURL")
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/most-saved", async (req, res) => {
  try {
    const lessons = await Lesson.find({ visibility: "Public" })
      .populate("creatorId", "name photoURL")
      .sort({ favoritesCount: -1 })
      .limit(3);
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/top-contributors", async (req, res) => {
  try {
    const result = await Lesson.aggregate([
      { $group: { _id: "$creatorId", lessonsCount: { $sum: 1 } } },
      { $sort: { lessonsCount: -1 } },
      { $limit: 4 },
    ]);

    const populated = await User.populate(result, { path: "_id", select: "name photoURL" });
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/my-lessons", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const lessons = await Lesson.find({ creatorId: user._id }).sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/admin/all", verifyAdmin, async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate("creatorId", "name email")
      .sort({ createdAt: -1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("creatorId", "name photoURL");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const lesson = await Lesson.create({ ...req.body, creatorId: user._id });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    if (lesson.creatorId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/like", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Not found" });

    const alreadyLiked = lesson.likes.includes(user._id);
    if (alreadyLiked) {
      lesson.likes.pull(user._id);
      lesson.likesCount = Math.max(0, lesson.likesCount - 1);
    } else {
      lesson.likes.push(user._id);
      lesson.likesCount += 1;
    }
    await lesson.save();
    res.json({ likesCount: lesson.likesCount, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/admin", verifyAdmin, async (req, res) => {
  try {
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Not found" });

    const isOwner = lesson.creatorId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Forbidden" });

    await Lesson.findByIdAndDelete(req.params.id);
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;