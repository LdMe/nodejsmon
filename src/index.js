import express from 'express';
import dotenv from 'dotenv';
import db from './config/db.js';
import router from './routes/router.js';
import cors from 'cors';

dotenv.config();
const app = express();

const corsOptions = {
    origin:process.env.FRONTEND_URL,
    credentials:true,
}
app.use(cors(corsOptions));

app.use(express.json({limit: '50mb'}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', router);

app.listen(3000, () => {
    console.log('Server is listening on port '+process.env.APP_PORT);
});