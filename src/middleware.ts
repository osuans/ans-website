import { defineMiddleware } from "astro:middleware";
import { timingSafeEqual } from "crypto";

const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));

  if (!isProtected) {
    return next();
  }

  const basicAuth = context.request.headers.get("Authorization");

  if (basicAuth?.startsWith("Basic ")) {
    const authValue = basicAuth.split(" ")[1];
    const decoded = Buffer.from(authValue, "base64").toString("utf-8");
    const [user = "", pass = ""] = decoded.split(":");

    const validUser = import.meta.env.ADMIN_USERNAME ?? "";
    const validPass = import.meta.env.ADMIN_PASSWORD ?? "";

    const isUserValid =
      user.length === validUser.length &&
      timingSafeEqual(Buffer.from(user), Buffer.from(validUser));

    const isPassValid =
      pass.length === validPass.length &&
      timingSafeEqual(Buffer.from(pass), Buffer.from(validPass));

    if (isUserValid && isPassValid) {
      return next();
    }
  }

  return new Response("Authorization required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
});
