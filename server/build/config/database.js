"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = __importDefault(require("sequelize"));
/**
 * Create a Sequelize instance. This can be done by passing
 * the connection parameters separately to the Sequelize constructor.
 */
//  console.log("process.env>>", process.env);
// @ts-ignore
const sequelize = new sequelize_1.default("ChatApp", 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});
/**
 * Export the Sequelize instance. This instance can now be
 * used in the app.js file to authenticate and establish a database connection.
 */
exports.default = sequelize;
