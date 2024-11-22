import { set } from "mongoose";
import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { redis } from "../lib/redis.js";



const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
    
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refreshToken:${userId}`, refreshToken, 'EX', 7 * 24 * 60 * 60); // 7-days
}

const setCookie = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // prevent xss attacks
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'strict', // prevent cross-site attacks
        maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true, // prevent xss attacks
        secure:process.env.NODE_ENV === 'production',
        sameSite: 'strict', // prevent cross-site attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
export const signup = async (req, res) => {
    const { name, email, password, role = 'customer' } = req.body;
    try {
        const userExists = await UserModel.findOne({ email });
    
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
    }        
        const user = await UserModel.create({ name, email, password, role: 'customer' });

        //authentication

        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookie(res, accessToken, refreshToken);


        res.status(201).json({ 
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },    
            message: "User created successfully",
        });
    
    } catch (error) {
        res.status(500).json({ message: error.message }); }
}       

export const login = async (req, res) => {
    res.send("login  route called");
}

export const logout = async (req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(refreshToken){
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken:${decoded.userId}`);
        }

        res.clearCookie('accessToken');     
        res.clearCookie('refreshToken');
        res.json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Failed to logout", error: error.message });      
    }
};

