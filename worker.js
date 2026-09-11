export default {
  fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/") || path === "/healthz") return env.API.fetch(request);
    return env.ASSETS.fetch(request);
  },
};
