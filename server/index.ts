import { Hono } from "hono";
import { cors } from "hono/cors";
import router from "./routes/routes";
import { prettyJSON } from "hono/pretty-json";
import { logging } from "./middleware/logger";
import { errorHandler, notFoundHandler } from "./middleware/errors";

const app = new Hono();

app.use(prettyJSON());
app.use(logging);

app.use(
  "*",
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    allowHeaders: ["X-Custom-Header", "Authorization", "Content-Type"],
    allowMethods: ["POST", "GET", "PUT", "PATCH", "OPTIONS"],
    maxAge: 84600,
    credentials: true,
  })
);

app.route("", router);
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default {
  port: parseInt(process.env.PORT || "8000"),
  fetch: app.fetch,
};
