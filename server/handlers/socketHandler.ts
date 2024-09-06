import { Server, Socket } from 'socket.io';
import Messages from '../controllers/messageController';

interface NewUserJoinedData {
  email: string;
  id: number;
  conversationId: string;
  firstName: string;
}

interface ChatMessageData {
  message: string;
  name: string;
  conversationId: string;
  senderId: number;
}

interface TaskUpdateData {
  task: string;
  name: string;
  conversationId: string;
  senderId: number;
  taskStatus: string;
}

const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // Handle new user joining
    socket.on('new-user-joined', async (data: NewUserJoinedData) => {
      const { email, id, conversationId, firstName: name } = data;
      console.log("new user>>", email, id);
      await Messages.insertMessage(`${name} joined the chat`, id, Number(conversationId), 'system');
      socket.broadcast.emit('user-joined', name);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    // Uncomment and refactor as needed
    /*
    socket.on('new-chat-message', (data: ChatMessageData) => {
      const { message, name, conversationId, senderId } = data;
      console.log("emit a chat>>", message);
      // Store the message in the Message table
      Messages.insertMessage(message, senderId, conversationId, 'user');
      // Broadcast the message to all users
      socket.broadcast.emit('chat-message', { message, name });
    });

    socket.on('task-update', (data: TaskUpdateData) => {
      const { task, name, conversationId, senderId, taskStatus } = data;
      console.log("task update>>", name, task);
      const message = `${name} completed the task: ${task}`;
      // Store the message in the Message table
      if (taskStatus === 'completed') {
        Messages.insertMessage(message, senderId, conversationId, 'system');
      }
      // Broadcast the message to all users
      socket.broadcast.emit('chat-message', { message, name: '' });
    });
    */
  });
};

export default socketHandler;
