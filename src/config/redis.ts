import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.log("Redis client error", err);
});

redisClient.on("connect", () => console.log("Redis Connected"));

export const connectRedis = async (): Promise<void> => {
    await redisClient.connect();
};

export default redisClient;
