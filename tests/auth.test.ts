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

describe('POST /api/auth/signup', () => {
    it('should create a user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'John', email: 'john@test.com', password: 'secret123' });

        expect(res.status).toBe(201);
        expect(res.body.token).toBeDefined();
        expect(res.body.user.email).toBe('john@test.com');
    });

    it('should return 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ email: 'john@test.com' });

        expect(res.status).toBe(400);
    });

    it('should return 409 if email already exists', async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({ name: 'John', email: 'john@test.com', password: 'secret123' });

        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'John', email: 'john@test.com', password: 'secret123' });

        expect(res.status).toBe(409);
    });
});

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await request(app)
            .post('/api/auth/signup')
            .send({ name: 'John', email: 'john@test.com', password: 'secret123' });
    });

    it('should login and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'john@test.com', password: 'secret123' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'john@test.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@test.com', password: 'secret123' });

        expect(res.status).toBe(401);
    });

    it('should return 400 if fields are missing', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'john@test.com' });

        expect(res.status).toBe(400);
    });
});
