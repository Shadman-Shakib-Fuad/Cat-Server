import { betterAuth } from "better-auth";
import { mongooseAdapter } from "better-auth/adapters/mongoose";
import mongoose from "mongoose";

export const auth = betterAuth({
  database: mongooseAdapter(mongoose.connection),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.CLIENT_URL],
});

export const verifyToken = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = session.user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const verifyAdmin = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = session.user;
    next();
  } catch {
    return res.status(403).json({ message: "Forbidden" });
  }
};