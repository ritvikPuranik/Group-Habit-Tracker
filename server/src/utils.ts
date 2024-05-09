import sequelize from '../config/database';
import Message from '../models/Message';
import User from '../models/User';

async function insertUser(email: string, password: string, name: string): Promise<number> {
    try {
        const [user, created] = await User.findOrCreate({ where: { email }, defaults: { password: password, first_name: name } });
        if (created) {
            console.log('User created successfully!');
            return user.id;
        } else {
            console.log('User already exists!');
            return 0;
        }
    } catch (error) {
        console.error('Error inserting user:', error);
        return 0;
    }
}

async function insertMessage(message: string, senderId: number, conversationId: number, type: string): Promise<void> {
    try {
        await Message.create({ message, sender_id: senderId, conversation_id: conversationId, message_type: type});
    } catch (error) {
        console.error('Error inserting message:', error);
    }
}

//function to fetch user record by email in sequelize
async function validateUser(email: string, password: string): Promise<number> {
    try {
        const user = await User.findOne({ where: { email } });
        if(user && user.password === password) {
            return user.id;
        }
        return 0;//return 0 if user not found
    } catch (error) {
        console.error('Error fetching user:', error);
        return 0;
    }
}
const getUsername = async (id: number) => {
    try {
        const user = await User.findOne({ where: { id } });
        if(user) {
            return user.first_name;
        }
        return 'User not found!';
    } catch (error) {
        console.error('Error fetching user:', error);
        return 'Error fetching user!';
    }
}

const getChatMessages = async (userId: number, conversationId: number) => {
    try {
        const messages = await Message.findAll({ where: { conversation_id: conversationId } });
        const allMessages = messages.map(async (message: { message: string; sender_id: number; message_type: string }) => {
            return {
                message: message.message,
                isSent: message.sender_id === userId,
                name: message.message_type=== 'system' ? '' : await getUsername(message.sender_id),//Check if system message and replace with ''. 
                conversationId: conversationId
            };
        });
        return Promise.all(allMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export { insertUser, validateUser, getUsername, insertMessage, getChatMessages };