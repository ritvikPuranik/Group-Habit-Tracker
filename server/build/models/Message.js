"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_js_1 = __importDefault(require("../config/database.js"));
const sequelize_1 = require("sequelize");
const Message = database_js_1.default.define(//stores the message data
"message", {
    message: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    conversation_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    sender_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    message_type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
});
exports.default = Message;
