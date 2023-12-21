import authController from "../controllers/authController.js";
import { Router } from "express";
import {isAuth} from '../middleware/authMiddleware.js';

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", isAuth,authController.logout);

export default router;