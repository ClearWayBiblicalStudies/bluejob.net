export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/signup") {
      return Response.redirect(`${url.origin}/signup.html`, 302);
    }
    if (request.method === "GET" && ["/login", "/signin", "/api/auth/login"].includes(url.pathname)) {
      return Response.redirect(`${url.origin}/login.html`, 302);
    }
    if (request.method === "GET" && url.pathname === "/forgot-password") {
      return Response.redirect(`${url.origin}/forgot-password.html`, 302);
    }
    if (request.method === "GET" && url.pathname === "/change-password") {
      return Response.redirect(`${url.origin}/change-password.html`, 302);
    }
    if (request.method === "GET" && url.pathname === "/reset-password") {
      return Response.redirect(`${url.origin}/reset-password.html${url.search}`, 302);
    }
    if (request.method === "GET" && url.pathname === "/api/auth/register") {
      return Response.redirect(`${url.origin}/signup.html`, 302);
    }
    if (url.pathname.startsWith("/api/")) return env.API.fetch(request);
    return env.ASSETS.fetch(request);
  },
};
