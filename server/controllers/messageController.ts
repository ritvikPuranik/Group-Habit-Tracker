import Message from '../models/Message';
import User from '../models/User';

interface MessageData {
    message: string,
    senderId: number,
    senderName: string,
    groupId: number,
}
interface NewMessageData extends MessageData {
    type: string
}
interface EditedMessageData extends MessageData {
    messageId: number
}

type DeletedMessageData = {
    messageId: number
}
class Messages {
    static userIdMapping: { [key: number]: string } = {};

    static insertMessage = async (data: NewMessageData): Promise<number> => {
        try {
            const { message, senderId, groupId, type } = data;
            let messageInfo = await Message.create({ message, sender_id: senderId, group_id: groupId, message_type: type });
            return messageInfo.id;
        } catch (error) {
            console.error('Error inserting message:', error);
            return 0; //couldn't insert message
        }
    }

    static editMessage = async (data: EditedMessageData): Promise<number> => {
        try {
            const { message, messageId } = data;
            
            const messageRecord = await Message.findOne({ where: { id: messageId } });
            console.log("Entered edit message>", messageId, messageRecord);
            const updatedMetadata = { ...messageRecord.metadata, edited: true };
            const [updatedCount] = await Message.update(
                {
                    message,
                    metadata: updatedMetadata
                },
                { where: { id: messageId } }
            );


            if (updatedCount > 0) {
                return messageId; // Return the messageId if update was successful
            } else {
                console.error('Message not found or no changes made.');
                return 0; // Return 0 if no rows were updated
            }

        } catch (error) {
            console.error('Error updating message:', error);
            return 0; // Return 0 in case of an error
        }
    }



    static getChatMessages = async (groupId: number): Promise<MessageData[]> => {
        try {
            const messages = await Message.findAll({ where: { group_id: groupId }, raw: true });
            console.log(JSON.stringify(messages[0]));
            const allMessages = messages.map(async (message: { id: number, message: string; sender_id: number; message_type: string, group_id: number, metadata: any }) => {
                let userName = '';
                if (this.userIdMapping[message.sender_id]) userName = this.userIdMapping[message.sender_id];
                else {
                    const user = await User.findByPk(message.sender_id, { attributes: ['first_name'] });
                    if (user) {
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
                    messageType: message.message_type,
                    edited: message.metadata.edited ? true : undefined,
                    deleted: message.metadata.deleted ? true : undefined
                };
            });
            return Promise.all(allMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    static deleteMessage = async (data: DeletedMessageData) => {
        try {
            const { messageId } = data;

            const messageRecord = await Message.findOne({ where: { id: messageId } });
            const updatedMetadata = { ...messageRecord.metadata, deleted: true };
            const [updatedCount] = await Message.update(
                {
                    metadata: updatedMetadata
                },
                { where: { id: messageId } }
            );

            if (updatedCount > 0) {
                return messageId; // Return the messageId if update was successful
            } else {
                console.error('Message not found or no changes made.');
                return 0; // Return 0 if no rows were updated
            }
        } catch (error) {
            console.error('Error updating message:', error);
            return 0; // Return 0 in case of an error
        }
    }

    static getMessage = async (filter: any): Promise<MessageData[]> => {
        try {
            const messages = await Message.findAll({ where: filter, raw: true });
            const allMessages = messages.map(async (message: { id: number, message: string; sender_id: number; message_type: string, group_id: number, edited: boolean }) => {
                let userName = '';
                if (this.userIdMapping[message.sender_id]) userName = this.userIdMapping[message.sender_id];
                else {
                    const user = await User.findByPk(message.sender_id, { attributes: ['first_name'] });
                    if (user) {
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
                    messageType: message.message_type,
                    edited: Boolean(message.edited)
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