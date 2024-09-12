import Message from '../models/Message';
import User from '../models/User';

type MessageData = {
    message: string,
    senderId: number, 
    senderName: string,
    groupId: number,
    type: string
}
class Messages {
    static userIdMapping: { [key: number]: string } = {};

    static insertMessage = async(data: MessageData): Promise<void> => {
        try {
            const {message, senderId, groupId, type} = data;
            await Message.create({ message, sender_id: senderId, group_id: groupId, message_type: type});
        } catch (error) {
            console.error('Error inserting message:', error);
        }
    }
    
    
    static getChatMessages = async (groupId: number): Promise<MessageData[]> => {
        try {
            const messages = await Message.findAll({ where: { group_id: groupId }, raw: true });
            
            const allMessages = messages.map(async (message: { id: number, message: string; sender_id: number; message_type: string, group_id: number }) => {
                let userName = '';
                if(this.userIdMapping[message.sender_id]) userName = this.userIdMapping[message.sender_id];
                else{
                    const user = await User.findByPk(message.sender_id, { attributes: ['first_name'] });
                    if(user){
                        userName = user.first_name;
                        this.userIdMapping[message.sender_id] = userName;
                    }

                }
                return {
                    message: message.message,
                    id: message.id,
                    senderId: message.sender_id,
                    senderName: userName,
                    groupId: message.group_id,
                    messageType: message.message_type
                };
            });
            return Promise.all(allMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }
}
export default Messages;