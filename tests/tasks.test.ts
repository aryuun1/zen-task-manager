import request from 'supertest';
import app from '../src/app';

jest.mock('../src/config/redis', () => ({
    __esModule: true,
    default: {
        get: jest.fn().mockResolvedValue(null),
        setEx: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        on: jest.fn(),
    },
    connectRedis: jest.fn().mockResolvedValue(undefined),
}));

const getToken = async (): Promise<string> => {
    const res = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'John', email: 'john@test.com', password: 'secret123' });
    return res.body.token;
};

describe('GET /api/tasks', () => {
    it('should return tasks from cache on second call', async () => {
        const token = await getToken();
        const mockTasks = [{ title: 'Cached Task' }];

        const redisClient = require('../src/config/redis').default;
        redisClient.get.mockResolvedValueOnce(JSON.stringify(mockTasks));

        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.source).toBe('cache');
        expect(res.body.tasks).toEqual(mockTasks);
    });

    it('should return tasks filtered by status', async () => {
        const token = await getToken();

        await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Pending Task', status: 'pending' });

        const res = await request(app)
            .get('/api/tasks?status=pending')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.tasks.every((t: { status: string }) => t.status === 'pending')).toBe(true);
    });
    it('should return 401 without token', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.status).toBe(401);
    });

    it('should return tasks for logged-in user', async () => {
        const token = await getToken();
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.tasks).toBeInstanceOf(Array);
    });
});

describe('POST /api/tasks', () => {

    it('should create a task', async () => {
        const token = await getToken();
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Task', description: 'Test desc', dueDate: '2026-03-10' });

        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Test Task');
        expect(res.body.status).toBe('pending');
    });

    it('should return 400 if title is missing', async () => {
        const token = await getToken();
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'No title here' });

        expect(res.status).toBe(400);
    });
});

describe('PUT /api/tasks/:id', () => {
    it('should update a task status', async () => {
        const token = await getToken();

        const created = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Original Title' });

        const res = await request(app)
            .put(`/api/tasks/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'completed' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('completed');
    });

    it('should return 404 for non-existent task', async () => {
        const token = await getToken();
        const res = await request(app)
            .put('/api/tasks/000000000000000000000000')
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'completed' });

        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
        const token = await getToken();

        const created = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'To Delete' });

        const res = await request(app)
            .delete(`/api/tasks/${created.body._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Task deleted');
    });

    it('should return 404 for non-existent task', async () => {
        const token = await getToken();
        const res = await request(app)
            .delete('/api/tasks/000000000000000000000000')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
    });
});
