import express from "express";
import authRouter from "./routes/auth.routes";
import taskRouter from "./routes/task.routes";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());


app.get("/health", (_req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);


export default app;
