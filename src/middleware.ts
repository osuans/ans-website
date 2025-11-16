import { defineMiddleware } from "astro:middleware";
import { timingSafeEqual } from "crypto";

// Define the routes you want to protect
const protectedRoutes = ["/admin"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Check if the request is for a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    const basicAuth = context.request.headers.get("Authorization");

    if (basicAuth && basicAuth.startsWith("Basic ")) {
      const authValue = basicAuth.split(" ")[1];
      const decoded = Buffer.from(authValue, "base64").toString("utf-8");
      const [user, pass] = decoded.split(":");

      // Securely get credentials from environment variables
      const validUser = import.meta.env.ADMIN_USERNAME;
      const validPass = import.meta.env.ADMIN_PASSWORD;

      // Use a constant-time comparison to prevent timing attacks
      const isUserValid = user.length === validUser.length && timingSafeEqual(Buffer.from(user), Buffer.from(validUser));
      const isPassValid = pass.length === validPass.length && timingSafeEqual(Buffer.from(pass), Buffer.from(validPass));

      if (isUserValid && isPassValid) {
        // If credentials are valid, proceed to the requested page
        return next();
      }
    }

    // If not authenticated, send a 401 Unauthorized response
    // This triggers the browser's built-in login prompt
    return new Response("Authorization required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  // For all other pages, continue as normal
  return next();
});