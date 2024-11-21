import User from "../models/user.model.js";
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
    
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = await User.create({
        name,
        email,
        password,
    });
    if (user) {
        res.status(201).json({ 
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    }
    } catch (error) {
        res.status(500).json({ message: error.message });
        
        
    }
}

export const login = async (req, res) => {
    res.send("login  route called");
}

export const logout = async (req, res) => {
    res.send("logout route called");
}

