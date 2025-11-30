import { getAuth } from "./auth";

export const getAuthUser = async (c: { env: Env; req: { raw: Request } }) => {
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  return session?.user ?? null;
};
