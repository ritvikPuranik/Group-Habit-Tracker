import sequelize from "../config/database.js";
import { Sequelize, DataTypes } from "sequelize";
import User from "./User.js";
import Group from "./Group.js";

const UserGroup = sequelize.define( //stores the message data
    "user-groups",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            references: {
              model: User, // Name of the target model
              key: 'id',      // Key in the target model
            },
            allowNull: false,
        },
        groupId: {
            type: DataTypes.INTEGER,
            references: {
                model: Group,
                key: 'id',
            },
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true,
        },

    },
);


User.belongsToMany(Group, { through: UserGroup });
Group.belongsToMany(User, { through: UserGroup });
export default UserGroup;