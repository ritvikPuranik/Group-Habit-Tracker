import sequelize from "../config/database.js";
import { Sequelize, DataTypes } from "sequelize";

const User = sequelize.define(
    "user",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        email:{
            type:DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        first_name:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false,
        },
        
    },
);


export default User;