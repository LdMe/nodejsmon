import Jwt from "jsonwebtoken";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();


const register = async (req, res) => {
    const { username, password, passwordConfirm } = req.body;
    const oldUser =await User.findOne({ username });
    if (oldUser) {
        res.status(400).send("User already exists");
        return;
    }
    if (password !== passwordConfirm) {
        res.status(400).send("Passwords do not match");
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json(user);
}

const login = async (req, res) => {
    const { username, password } = req.body;
    const oldUser = await User.findOne({ username });
    if (!oldUser) {
        res.status(404).send("User does not exist");
        return;
    }
    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
    if (!isPasswordCorrect) {
        res.status(400).send("Invalid credentials");
        return;
    }
    const token = Jwt.sign({ username: oldUser.username, id: oldUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    /* send token in a cookie */
    res.cookie("token", token, { 
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 3600000

     });

    res.status(200).json({
        result:
        {
            username: oldUser.username,
            id: oldUser._id
        },
        token
    });
}

const logout = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: false,
        secure: false,
        sameSite: 'none',
        expires: new Date(0)
    });
    res.status(200).send("Logged out");
}


export default { register, login,logout };