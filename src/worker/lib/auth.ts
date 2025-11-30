import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordData = encoder.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordData,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);

  return btoa(String.fromCharCode(...combined));
};

const verifyPassword = async (
  password: string,
  storedHash: string
): Promise<boolean> => {
  try {
    const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);

    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordData,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );

    const hashArray = new Uint8Array(hash);

    if (hashArray.length !== storedHashBytes.length) return false;
    return hashArray.every((byte, i) => byte === storedHashBytes[i]);
  } catch {
    return false;
  }
};

export const getAuth = (env: Env) => {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
      password: {
        hash: hashPassword,
        verify: async ({ password, hash }) => verifyPassword(password, hash),
      },
      sendResetPassword: async ({ user, token, url }) => {
        // TODO: Implement email sending functionality
        // For now, just log the reset URL
        const origin = new URL(url).origin;
        const resetUrl = `${origin}/reset-password/${token}`;
        console.log(`Password reset URL for ${user.email}: ${resetUrl}`);
      },
    },
  });
};
