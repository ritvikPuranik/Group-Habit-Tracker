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
exports.getChatMessages = exports.insertMessage = exports.getUsername = exports.validateUser = exports.insertUser = void 0;
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
function insertUser(email, password, name) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [user, created] = yield User_1.default.findOrCreate({ where: { email }, defaults: { password: password, first_name: name } });
            if (created) {
                console.log('User created successfully!');
                return user.id;
            }
            else {
                console.log('User already exists!');
                return 0;
            }
        }
        catch (error) {
            console.error('Error inserting user:', error);
            return 0;
        }
    });
}
exports.insertUser = insertUser;
function insertMessage(message, senderId, conversationId, type) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Message_1.default.create({ message, sender_id: senderId, conversation_id: conversationId, message_type: type });
        }
        catch (error) {
            console.error('Error inserting message:', error);
        }
    });
}
exports.insertMessage = insertMessage;
//function to fetch user record by email in sequelize
function validateUser(email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findOne({ where: { email } });
            if (user && user.password === password) {
                return user.id;
            }
            return 0; //return 0 if user not found
        }
        catch (error) {
            console.error('Error fetching user:', error);
            return 0;
        }
    });
}
exports.validateUser = validateUser;
const getUsername = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findOne({ where: { id } });
        if (user) {
            return user.first_name;
        }
        return 'User not found!';
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return 'Error fetching user!';
    }
});
exports.getUsername = getUsername;
const getChatMessages = (userId, conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield Message_1.default.findAll({ where: { conversation_id: conversationId } });
        const allMessages = messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
            return {
                message: message.message,
                isSent: message.sender_id === userId,
                name: message.message_type === 'system' ? '' : yield getUsername(message.sender_id), //Check if system message and replace with ''. 
                conversationId: conversationId
            };
        }));
        return Promise.all(allMessages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
});
exports.getChatMessages = getChatMessages;
