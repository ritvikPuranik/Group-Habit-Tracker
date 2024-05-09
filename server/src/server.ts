import express from 'express';
import { Server } from 'socket.io';
import { createServer, get } from 'http';
import sequelize from '../config/database';

import { insertUser, validateUser, getUsername, insertMessage, getChatMessages } from './utils';

// Create a new express application instance
const app: express.Application = express();
const server = createServer(app);

app.use(express.json());//parse json request body

let users: { [id: string]: {email: string, id: number, name: string} } = {};

//handle cors issue
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Initialize a new instance of socket.io by passing the HTTP server object
const io = new Server({
    cors: {
    origin: "http://localhost:3001"
  }
});
io.listen(server);

app.get('/', (req, res) => {
    res.status(200);
});

app.post('/login', async (req, res) => {
    console.log('login>', req.body);
    const {email, password} = req.body;
    const id: number = await validateUser(email, password);
    id ? res.status(201).send({id: id}): res.status(400).send({error: 'Invalid credentials!'});
});
app.post('/register', async (req, res) => {
    console.log('register>', req.body);
    const {email, password, name} = req.body;
    const id = await insertUser(email, password, name);
    id ? res.status(201).send({id: id}): res.status(400).send({error: 'User already exists!'});
});

app.get('/getUsername', async(req, res) => {
    const name = await getUsername(Number(req.query.id));
    res.status(200).send({name: name});
});

app.get('/getChatMessages', async(req, res) => {
    const {conversationId, userId} = req.query;
    console.log("userId>>", userId);
    const messages = await getChatMessages(Number(userId), Number(conversationId));//the user id is matched with sender_id to determine isSent
    res.status(200).send({messages: messages});
});

io.on('connection', (socket) => {
    // socket.emit('chat message', 'Welcome to the chat room!');
    socket.on('new-user-joined', async({email, id, conversationId}) => {
        console.log("new user>>", email, id);
        const name = await getUsername(id);
        insertMessage(`${name} joined the chat`, id, Number(conversationId), 'system');
        users[id] = {email: email, id: id, name: name};
        socket.broadcast.emit('user-joined', name);
    });


    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('new-chat-message', ({message, name, conversationId, senderId}) => {
        console.log("emit a chat>>", message);
        //store the message in the Message table
        insertMessage(message, senderId, conversationId, 'user');
        //broadcast the message to all users
        socket.broadcast.emit('chat-message', {message: message, name: name});
    });
    socket.on('task-update', ({task, name, conversationId, senderId, taskStatus}) => {
        console.log("task update>>", name, task);
        const message = `${name} completed the task: ${task}`;
        //store the message in the Message table
        if(taskStatus === 'completed'){
            insertMessage(message, senderId, conversationId, 'system');
        }
        //broadcast the message to all users
        socket.broadcast.emit('chat-message', {message: message, name: ''});
    });
});

//initialize the server
const initApp = async () => {
    console.log("Establishing Connection...");
    try {
        await sequelize.authenticate();
        // await sequelize.sync({force: true});
        await sequelize.sync();
        console.log("Connection has been established successfully.");
        server.listen(3000, () => {
            console.log('listening on *:3000');
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
initApp();