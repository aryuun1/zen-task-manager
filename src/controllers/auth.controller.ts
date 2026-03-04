import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/users.models';


const generateToken = (id: string): string => {
    const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
    };
    return jwt.sign({ id }, process.env.JWT_SECRET as string, options);
};


//signup controller
export const signup = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    //handling missing fields
    if (!name || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
    }

    //existing user
    const existing = await User.findOne({ email });
    if (existing) {
        res.status(409).json({ message: 'email already in use' });
        return;
    }

    //create user
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
        token,
        message: 'User created successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

//login controller
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    //handle missing fields
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    //successful login flow
    const user = await User.findOne({ email });

    //invalid credentials
    if (!user || !(await user.comparePassword(password))) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
    }

    //generate token
    const token = generateToken(user._id.toString());

    //send response
    res.status(200).json({
        token,
        message: 'User logged in successfully',
        user: { id: user._id, name: user.name, email: user.email },
    });
};

