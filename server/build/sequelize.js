"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    database: 'ChatApp',
    dialect: 'mysql',
    username: 'root',
    password: '',
    models: [__dirname + '/models'],
});
