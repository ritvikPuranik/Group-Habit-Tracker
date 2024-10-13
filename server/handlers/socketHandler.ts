import { Server, Socket } from 'socket.io';
import Messages from '../controllers/messageController';

interface UserJoinedData {
  email: string;
  id: number;
  groupId: number;
  firstName: string;
}

interface ChatMessageData {
  message: string;
  senderName: string;
  groupId: number;
  senderId: number;
}

interface NewChatMessageData extends ChatMessageData{
  type: string;
}

interface EditedChatMessageData extends ChatMessageData{
  messageId: number;
}

type DeletedMessageData = {
  messageId: number
}

// interface TaskUpdateData {
//   task: string;
//   name: string;
//   roomId: string;
//   senderId: number;
//   taskStatus: string;
// }

const socketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    // TODO ---- Handle new user joining

    socket.on('join-group', async (data: UserJoinedData) => {//This is for everytime a user clicks on any group, he is made part of the chatroom to receive messages
      const { email, id, groupId, firstName: name } = data;

      // Join the specified chatroom
      socket.join(`group-${groupId}`);
      console.log(`${name} joined chatroom ${groupId}`);
    });

    socket.on('new-chat-message', async(data: NewChatMessageData) => {
      const { message, senderName, groupId, senderId, type } = data;
      console.log("emit a chat>>", message);
      try{
        // Store the message in the Message table
        const id = await Messages.insertMessage(data);
        
        // Broadcast the message to all users in the group, excluding the sender
        io.to(`group-${groupId}`).emit('chat-message', { message, senderName, senderId, id: id, type: type });
        console.log(`Message broadcasted to -> group-${groupId}`);
      }catch(err){
        console.log("error while broadcasting to group>>", err);
      }
    });

    socket.on('edit-chat-message', async(data: EditedChatMessageData) => {
      const { message, senderName, groupId, senderId, messageId } = data;
      try{
        const id = await Messages.editMessage(data);
        
        // Broadcast the message to all users in the group, excluding the sender
        io.to(`group-${groupId}`).emit('edit-chat-message', { message, senderName, senderId, id: id });//Cannot use the same chat-message channel because it renders new entry on ui. edited message will show up on a new line then
        console.log(`Message broadcasted to -> group-${groupId}`);
      }catch(err){
        console.log("error while broadcasting to group>>", err);
      }
    });

    socket.on('delete-chat-message', async(data: DeletedMessageData) => {
      const { messageId } = data;
      try{
        const id = await Messages.deleteMessage(data);
        console.log(`response from delete message function>>${id}`);
        const messageInfo = await Messages.getMessage({id: messageId});
        console.log(`Message Info> ${messageInfo}`);
        const groupId = 1, senderName = 'a', senderId = 1;
        
        // Broadcast the message to all users in the group, excluding the sender
        io.to(`group-${groupId}`).emit('delete-chat-message', { senderName, senderId, id: id });
        console.log(`Message broadcasted to -> group-${groupId}`);
      }catch(err){
        console.log("error while broadcasting to group>>", err);
      }
    });


    // socket.on('task-update', (data: TaskUpdateData) => {
    //   const { task, name, conversationId, senderId, taskStatus } = data;
    //   console.log("task update>>", name, task);
    //   const message = `${name} completed the task: ${task}`;
    //   // Store the message in the Message table
    //   if (taskStatus === 'completed') {
    //     Messages.insertMessage(message, senderId, conversationId, 'system');
    //   }
    //   // Broadcast the message to all users
    //   socket.broadcast.emit('chat-message', { message, name: '' });
    // });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

export default socketHandler;
