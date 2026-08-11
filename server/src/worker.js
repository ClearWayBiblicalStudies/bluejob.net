import { Client } from "pg";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health/db") {
      const client = new Client({
        connectionString: env.HYPERDRIVE.connectionString,
      });

      try {
        await client.connect();
        const result = await client.query(
          "SELECT current_database(), NOW()",
        );

        return Response.json({
          ok: true,
          ...result.rows[0],
        });
      } catch (error) {
        return Response.json(
          {
            ok: false,
            error: "Database health check failed",
          },
          { status: 500 },
        );
      } finally {
        await client.end().catch(() => {});
      }
    }

    return new Response("BlueJob API");
  },
};
