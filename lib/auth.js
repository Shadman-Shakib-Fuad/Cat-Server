import { betterAuth } from "better-auth";

export const getAuth = () =>
  betterAuth({
    database: {
      type: "mongodb",
      url: process.env.MONGODB_URI,
      dbName: "digitallifelessons",
    },
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
  });