import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import connectDB from "./lib/db.js";
import { auth } from "./middleware/verifyToken.js";

import userRoutes from "./routes/userRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

const authHandler = toNodeHandler(auth);
app.use("/api/auth", (req, res) => {
  req.url = req.url === "" ? "/" : req.url;
  authHandler(req, res);
});

app.get("/", (req, res) => res.json({ message: "Digital Life Lessons API running" }));

app.use("/api/users", userRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));