import sequelize from "../config/database.js";
import { Sequelize, DataTypes } from "sequelize";

const Group = sequelize.define( //stores the message data
    "groups",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }, 
        admin: { //User Id of the group admin
            type: DataTypes.INTEGER,
            allowNull: false
        }
        

    },
);


export default Group;