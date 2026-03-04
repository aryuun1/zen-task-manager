import app from "./app";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB();
        await connectRedis();
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Error connecting to MongoDB or Redis:", error);
    }
};

start();