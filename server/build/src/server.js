"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const database_1 = __importDefault(require("../config/database"));
const utils_1 = require("./utils");
// Create a new express application instance
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
app.use(express_1.default.json()); //parse json request body
let users = {};
//handle cors issue
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// Initialize a new instance of socket.io by passing the HTTP server object
const io = new socket_io_1.Server({
    cors: {
        origin: "http://localhost:3001"
    }
});
io.listen(server);
app.get('/', (req, res) => {
    res.status(200);
});
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('login>', req.body);
    const { email, password } = req.body;
    const id = yield (0, utils_1.validateUser)(email, password);
    id ? res.status(201).send({ id: id }) : res.status(400).send({ error: 'Invalid credentials!' });
}));
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('register>', req.body);
    const { email, password, name } = req.body;
    const id = yield (0, utils_1.insertUser)(email, password, name);
    id ? res.status(201).send({ id: id }) : res.status(400).send({ error: 'User already exists!' });
}));
app.get('/getUsername', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = yield (0, utils_1.getUsername)(Number(req.query.id));
    res.status(200).send({ name: name });
}));
app.get('/getChatMessages', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId, userId } = req.query;
    console.log("userId>>", userId);
    const messages = yield (0, utils_1.getChatMessages)(Number(userId), Number(conversationId)); //the user id is matched with sender_id to determine isSent
    res.status(200).send({ messages: messages });
}));
io.on('connection', (socket) => {
    // socket.emit('chat message', 'Welcome to the chat room!');
    socket.on('new-user-joined', (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, id, conversationId }) {
        console.log("new user>>", email, id);
        const name = yield (0, utils_1.getUsername)(id);
        (0, utils_1.insertMessage)(`${name} joined the chat`, id, Number(conversationId), 'system');
        users[id] = { email: email, id: id, name: name };
        socket.broadcast.emit('user-joined', name);
    }));
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('new-chat-message', ({ message, name, conversationId, senderId }) => {
        console.log("emit a chat>>", message);
        //store the message in the Message table
        (0, utils_1.insertMessage)(message, senderId, conversationId, 'user');
        //broadcast the message to all users
        socket.broadcast.emit('chat-message', { message: message, name: name });
    });
    socket.on('task-update', ({ task, name, conversationId, senderId, taskStatus }) => {
        console.log("task update>>", name, task);
        const message = `${name} completed the task: ${task}`;
        //store the message in the Message table
        if (taskStatus === 'completed') {
            (0, utils_1.insertMessage)(message, senderId, conversationId, 'system');
        }
        //broadcast the message to all users
        socket.broadcast.emit('chat-message', { message: message, name: '' });
    });
});
//initialize the server
const initApp = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Establishing Connection...");
    try {
        yield database_1.default.authenticate();
        // await sequelize.sync({force: true});
        yield database_1.default.sync();
        console.log("Connection has been established successfully.");
        server.listen(3000, () => {
            console.log('listening on *:3000');
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
initApp();
