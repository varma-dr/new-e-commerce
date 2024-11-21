import UserModel from "../models/user.model.js";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
    
};
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


        res.status(201).json({
            message: "User created successfully",
            user: user 
        });
    
    } catch (error) {
        res.status(500).json({ message: error.message }); }
}       

export const login = async (req, res) => {
    res.send("login  route called");
}

export const logout = async (req, res) => {
    res.send("logout route called");
}

