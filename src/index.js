import express from 'express';
import dotenv from 'dotenv';
import db from './config/db.js';
import router from './routes/router.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIo } from 'socket.io';


dotenv.config();
const app = express();

const corsOptions = {
    origin: [process.env.FRONTEND_URL, process.env.FRONTEND_TEST_URL],
    credentials: true,
}
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api', router);

const httpServer = createServer(app);
const socketIo = new SocketIo(httpServer, {
    cors: corsOptions
});
const MAIN_ROOM = 'main';
const members = [];
socketIo.on('connection', (socket) => {
    console.log(`socket ${socket.id} connected`);
    socket.on('disconnect', () => {
        try {
            socket.leave(MAIN_ROOM);
            console.log(`socket ${socket.id} disconnected`);
            const index = members.findIndex(member => member.socketId === socket.id);
            if (index === -1) {
                return;
            }
            const username = members[index].username;
            members.splice(index, 1);
            socketIo.to(MAIN_ROOM).emit('leave', username);
            console.log(`socket ${socket.id} disconnected`);
        }
        catch (e) {
            console.error(e);
        }
    })
    socket.on('join', (data) => {
        try {
            console.log(data);
            console.log(`user ${data.username} joined room ${data.room}`);
            socketIo.to(data.room).emit('join', data.username);
            socket.join(data.room);
            socket.emit('members', members.map(member => member.username));
            const oldMember = members.find(member => member.username === data.username);
            if (!oldMember) {
                members.push({ username: data.username, socketId: socket.id });
            }
            else {
                oldMember.socketId = socket.id;
            }
        }
        catch (e) {
            console.error(e);
        }

    });
    socket.on('leave', (data) => {
        try {
            console.log(`user ${data.username} left room ${data.room}`);
            socketIo.to(data.room).emit('leave', data.username);
            socket.leave(data.room);
            const index = members.findIndex(member => member.username === data.username);
            if (index !== -1) {
                members.splice(index, 1);
            }
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('message', (message) => {
        try {
            console.log('message: ' + message);
            socketIo.to(message.room).emit('message', message);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('ask-to-fight', (data) => {
        try {
            console.log('ask-to-fight: ' + JSON.stringify(data));
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('ask-to-fight', userFrom.username);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('accept-fight', (data) => {
        try {
            console.log('accept-fight: ' + data);
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('accept-fight', userFrom.username);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('reject-fight', (data) => {
        try {
            console.log('reject-fight: ' + data);
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('reject-fight', userFrom.username);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('attack', (data) => {
        try {
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('attack', data);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('update', (data) => {
        try {
            console.log('update: ' + JSON.stringify(data));
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('update', data);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('swap', (data) => {
        try {
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('swap', data);
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on('combat-end', (data) => {
        try {
            const userFrom = members.find(member => member.socketId === socket.id);
            console.log("username: " + data.username)
            const userTo = members.find(member => member.username === data.username);
            if (!userTo) {
                console.log('user not found');
                return;
            }
            socketIo.to(userTo.socketId).emit('combat-end', data);
        }
        catch (e) {
            console.error(e);
        }
    });

});

httpServer.listen(3000, () => {
    console.log('Server is listening on port ' + process.env.APP_PORT);
});