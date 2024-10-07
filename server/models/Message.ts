import sequelize from "../config/database.js";
import { Sequelize, DataTypes } from "sequelize";
import Group from "./Group.js";
import User from "./User.js";

const Message = sequelize.define( //stores the message data
    "messages",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        message:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        group_id:{
            type:DataTypes.INTEGER,
            references: {
                model: Group, // Name of the target model
                key: 'id',      // Key in the target model
            },
            allowNull: false,
        },
        sender_id:{
            type:DataTypes.INTEGER,
            references: {
                model: User, // Name of the target model
                key: 'id',      // Key in the target model
            },
            allowNull: true, //If sent by system
        },
        edited:{
            type:DataTypes.BOOLEAN,
            defaultValue: false, // Set default value for 'edited' to false, whenever a new message is created
        },
        message_type:{
            type: DataTypes.STRING,
            allowNull: false,
        },

    },
);

User.hasMany(Message, { foreignKey: 'sender_id' });
Message.belongsTo(User, { foreignKey: 'sender_id' }); // Each Message belongs to one User

Group.hasMany(Message, { foreignKey: 'group_id' });
Message.belongsTo(Group, { foreignKey: 'group_id' }); // Each Message belongs to one Group

export default Message;