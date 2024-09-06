import Message from '../models/Message';

class Messages {
    static insertMessage = async(message: string, senderId: number, conversationId: number, type: string): Promise<void> => {
        try {
            await Message.create({ message, sender_id: senderId, conversation_id: conversationId, message_type: type});
        } catch (error) {
            console.error('Error inserting message:', error);
        }
    }
    
    
    static getChatMessages = async (userId: number, conversationId: number) => {
        try {
            const messages = await Message.findAll({ where: { conversation_id: conversationId } });
            const allMessages = messages.map(async (message: { message: string; sender_id: number; message_type: string }) => {
                return {
                    message: message.message,
                    isSent: message.sender_id === userId,
                    // name: message.message_type=== 'system' ? '' : await this.getUsername(message.sender_id),//Check if system message and replace with ''. 
                    conversationId: conversationId
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