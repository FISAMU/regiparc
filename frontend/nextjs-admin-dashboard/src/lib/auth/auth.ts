import { betterAuth } from "better-auth";
import { authorizationPlugins } from "./modules/authorization";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: false,
    },
  },
  plugins: authorizationPlugins,
});
