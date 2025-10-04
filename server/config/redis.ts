import Redis from "ioredis";

export const redis = new Redis(
  process.env.REDIS_URL || "redis://mysecurepassword@localhost:6379"
);

redis.on("connect", () => {
  console.log("Redis connected");
});
redis.on("error", (err: Error) => {
  console.error("Redis Error:", err);
});
