import { betterAuth } from "better-auth";
import { env } from "../config/env.js";

export const auth = betterAuth({
  baseURL: "http://localhost:8000/",
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
});
