import sequelize from "../config/database.js";
import { Sequelize, DataTypes } from "sequelize";

const Message = sequelize.define( //stores the message data
    "message",
    {
        message:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        conversation_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
        },
        sender_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
        },
        message_type:{
            type: DataTypes.STRING,
            allowNull: false,
        },

    },
);


export default Message;