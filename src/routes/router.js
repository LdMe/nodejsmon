import {Router } from 'express';
import PokemonRouter from './pokemon.js';
import AuthRouter from './auth.js';
import UserRouter from './user.js';
import AdminRouter from './admin.js';
import GymRouter from './gym.js';

import {isAuth,isAdmin} from '../middleware/authMiddleware.js';

const router = Router();

router.use('/pokemon', isAuth,PokemonRouter);

router.use('/user', AuthRouter);
router.use('/user', isAuth,UserRouter);
router.use('/admin', isAdmin,AdminRouter);
router.use('/gyms', isAuth,GymRouter);

export default router;

