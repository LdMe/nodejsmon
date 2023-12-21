import userController from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.get("/users", async(req, res) => {
    try {
        const users = await userController.getAllUsers();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al obtener usuarios"});
    }
});

router.get("/users/connected", async(req, res) => {
    try {
        const users = await userController.getConnectedUsers();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error:"error al obtener usuarios"});
    }
});



export default router;