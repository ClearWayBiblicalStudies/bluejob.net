import { Client } from "pg";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === "/api/healthz") {
      return jsonResponse({ ok: true, service: "bluejob-api" });
    }

    if (pathname === "/api/readyz") {
      let connected = false;
      let response;
      const client = new Client({
        connectionString: env.HYPERDRIVE?.connectionString,
      });

      try {
        await client.connect();
        connected = true;
        await client.query("SELECT 1 AS ready");
        response = jsonResponse({ ok: true, database: "ready" });
      } catch {
        response = jsonResponse(
          { ok: false, database: "unavailable" },
          503,
        );
      } finally {
        if (connected) {
          await client.end().catch(() => {});
        }
      }

      return response;
    }

    return new Response("BlueJob API");
  },
};
