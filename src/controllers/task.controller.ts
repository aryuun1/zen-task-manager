import { Request, Response } from 'express';
import Task from '../models/task.model';
import redisClient from '../config/redis';


const CACHE_TTL = 600;

const getCacheKey = (userId: string) => `tasks:${userId}`;

export const getTasks = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const { status, dueDate } = req.query;

    //only cache unfiltered requests
    const isFiltered = status || dueDate;
    const cacheKey = getCacheKey(userId);

    if (!isFiltered) {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            res.status(200).json({
                source: 'cache',
                tasks: JSON.parse(cached)
            });
            return;
        }
    }

    const filter: Record<string, unknown> = { owner: userId };

    if (status) filter.status = status;
    if (dueDate) filter.dueDate = { $lte: new Date(dueDate as string) };

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    if (!isFiltered) {
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(tasks));
    }
    res.status(200).json({
        source: 'database',
        tasks
    })
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
    const { title, description, status, dueDate } = req.body;
    const userId = req.user!._id.toString();

    if (!title) {
        res.status(400).json({ message: 'Title is required' });
        return;
    }

    const task = await Task.create({
        title,
        description,
        status,
        dueDate,
        owner: userId,
    });

    await redisClient.del(getCacheKey(userId));

    res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const task = await Task.findOne({ _id: req.params.id, owner: userId });

    if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
    }

    const { title, description, status, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);

    await task.save();
    await redisClient.del(getCacheKey(userId));

    res.status(200).json(task);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: userId });

    if (!task) {
        res.status(404).json({ message: 'Task not found' });
        return;
    }

    await redisClient.del(getCacheKey(userId));

    res.status(200).json({ message: 'Task deleted' });
};