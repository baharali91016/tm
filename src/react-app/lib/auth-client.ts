import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export const {
  signUp,
  signIn,
  requestPasswordReset,
  resetPassword,
  signOut,
  getSession,
  useSession,
} = authClient;
