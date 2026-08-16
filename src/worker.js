export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return env.API.fetch(request);
    }
    if (url.pathname === '/healthz') {
      return new Response(JSON.stringify({ ok: true, service: 'bluejob-net' }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
