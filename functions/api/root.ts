import { Context, Hono } from "hono";
import { handle } from "hono/cloudflare-pages";

const app = new Hono().basePath("/api");
const route = app.get(
  "/hello",
  (c: Context) => {
    return c.json({
      message: `Hello !`,
    });
  },
);

export type ApiType = typeof route;

export const onRequest = handle(app);
