import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer, get } from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

//Db related imports
import sequelize from '../config/database';
import setAssociations from '../models/associations';

//Routers
import authRouter from '../routes/authRoutes';
import usergroupRouter from '../routes/usergroupRoutes';
import chatRouter from '../routes/chatRoutes';

//Middlewares import
import isAuthenticated from '../middlewares/isAuthenticated';

//Handlers
import socketHandler from '../handlers/socketHandler';


dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


const SYNC = false; //This is true if we have schema update


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
app.use(passport.session());
app.use(cors({
    origin: process.env.CONSOLE_URL,
    credentials: true, // Allow credentials (cookies) to be sent
}));

//Routers
app.use('/', authRouter);
app.use('/usergroups', isAuthenticated, usergroupRouter); //All routes have to be authenticated
app.use('/chat', isAuthenticated, chatRouter); //All routes have to be authenticated


// Initialize a new instance of socket.io by passing the HTTP server object
const io = new Server({
    cors: {
    origin: process.env.CONSOLE_URL
  }
});
io.listen(server);
socketHandler(io);

app.get('/', isAuthenticated, (req, res) => {
    console.log("request user>", req.user);
    res.status(200).json({ success: true, message: 'Welcome to your dashboard!', user: req.user });
});


//initialize the server
const initApp = async () => {
    console.log("Establishing Connection...");
    try {
        await sequelize.authenticate();
        if(SYNC){
            setAssociations();//Sets associations before sync
            await sequelize.sync({force: true});
        }
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