import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer, get } from 'http';
var cookieParser = require('cookie-parser');
import session from 'express-session';
import passport from 'passport';

import sequelize from '../config/database';
import Users from '../utility/userUtils';
import authRouter from '../routes/authRoutes';
import isAuthenticated from '../middlewares/isAuthenticated';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Create a new express application instance
const app: express.Application = express();
const server = createServer(app);

//Middlewares
app.use(express.json());//parse json request body
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'abc123',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        httpOnly: true, // Helps prevent XSS attacks
        // sameSite: 'lax', // Adjust as needed: 'strict', 'lax', or 'none'
        maxAge: 1000 * 60 * 60 * 24 // Cookie expiry (1 day)
    
     }
}));
// app.use(passport.authenticate('session'));
app.use(passport.session());
app.use(cors({
    origin: process.env.CONSOLE_URL,
    credentials: true, // Allow credentials (cookies) to be sent
  }));
  

// Define user type
interface User {
    id: number;
    email?: string;
    password?: string; // Assuming password might be stored, but ideally it should not be in the session
    // Add more fields as needed
}

//Routers
app.use('/', authRouter);

// let users: { [id: string]: {email: string, id: number, name: string} } = {};

// // Initialize a new instance of socket.io by passing the HTTP server object
// const io = new Server({
//     cors: {
//     origin: process.env.CONSOLE_URL
//   }
// });
// io.listen(server);

app.get('/', isAuthenticated, (req, res) => {
    console.log("request user>", req.user);
    res.status(200).json({ success: true, message: 'Welcome to your dashboard!', user: req.user });

});


// app.get('/getUsername', async(req, res) => {
//     const name = await getUsername(Number(req.query.id));
//     res.status(200).send({name: name});
// });

// app.get('/getChatMessages', async(req, res) => {
//     const {conversationId, userId} = req.query;
//     console.log("userId>>", userId);
//     const messages = await getChatMessages(Number(userId), Number(conversationId));//the user id is matched with sender_id to determine isSent
//     res.status(200).send({messages: messages});
// });

// io.on('connection', (socket) => {
//     // socket.emit('chat message', 'Welcome to the chat room!');
//     socket.on('new-user-joined', async({email, id, conversationId}) => {
//         console.log("new user>>", email, id);
//         const name = await getUsername(id);
//         insertMessage(`${name} joined the chat`, id, Number(conversationId), 'system');
//         users[id] = {email: email, id: id, name: name};
//         socket.broadcast.emit('user-joined', name);
//     });


//     socket.on('disconnect', () => {
//         console.log('user disconnected');
//     });

//     socket.on('new-chat-message', ({message, name, conversationId, senderId}) => {
//         console.log("emit a chat>>", message);
//         //store the message in the Message table
//         insertMessage(message, senderId, conversationId, 'user');
//         //broadcast the message to all users
//         socket.broadcast.emit('chat-message', {message: message, name: name});
//     });
//     socket.on('task-update', ({task, name, conversationId, senderId, taskStatus}) => {
//         console.log("task update>>", name, task);
//         const message = `${name} completed the task: ${task}`;
//         //store the message in the Message table
//         if(taskStatus === 'completed'){
//             insertMessage(message, senderId, conversationId, 'system');
//         }
//         //broadcast the message to all users
//         socket.broadcast.emit('chat-message', {message: message, name: ''});
//     });
// });

//initialize the server
const initApp = async () => {
    console.log("Establishing Connection...");
    try {
        await sequelize.authenticate();
        // await sequelize.sync({force: true});
        await sequelize.sync();
        console.log("Connection has been established successfully.");
        server.listen(process.env.SERVER_PORT, () => {
            console.log(`listening on ${process.env.SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
initApp();