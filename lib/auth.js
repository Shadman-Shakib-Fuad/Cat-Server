import { betterAuth } from "better-auth";
import { mongooseAdapter } from "better-auth/adapters/mongoose";
import mongoose from "mongoose";

export const createAuth = () =>
  betterAuth({
    database: mongooseAdapter(mongoose.connection),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.CLIENT_URL],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "user" },
        isPremium: { type: "boolean", defaultValue: false },
        photoURL: { type: "string", defaultValue: "" },
      },
    },
  });

let _auth;
export const getAuth = () => {
  if (!_auth) _auth = createAuth();
  return _auth;
};