import  Jwt  from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const isAuth = (req, res, next) => {
    const cookie = req.headers.cookie;
    if(!cookie){
        res.status(401).json({error:"Unauthorized: No cookie provided"});
        return;
    }
    const token = cookie.split("=")[1];
    if (!token) {
        res.status(401).json({error:"Unauthorized: No token provided"});
        return;
    }
    try {
        const decoded = Jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error:"Unauthorized: Invalid token"});
        return;
    }
}
// check if is auth and admin
const isAdmin = (req, res, next) => {
    const cookie = req.headers.cookie;
    if(!cookie){
        res.status(401).json({error:"Unauthorized: No cookie provided"});
        return;
    }
    const token = cookie.split("=")[1];
    if (!token) {
        res.status(401).json({error:"Unauthorized: No token provided"});
        return;
    }
    try {
        const decoded = Jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.role !== "admin"){
            res.status(401).json({error:"Unauthorized: User is not admin"});
            return;
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({error:"Unauthorized: Invalid token"});
        return;
    }
}

export {
    isAuth,
    isAdmin
}