import { getAuth } from "../lib/auth.js";

export const verifyToken = async (req, res, next) => {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: new Headers(req.headers),
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
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: new Headers(req.headers),
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