import  Jwt  from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const isAuth = (req, res, next) => {
    const cookie = req.headers.cookie;
    if(!cookie){
        res.status(401).send("Unauthorized: No cookie provided");
        return;
    }
    const token = cookie.split("=")[1];
    if (!token) {
        res.status(401).send("Unauthorized: No token provided");
        return;
    }
    try {
        const decoded = Jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send("Unauthorized: Invalid token");
        return;
    }
}

export {
    isAuth
}