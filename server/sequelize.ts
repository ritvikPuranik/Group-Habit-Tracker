import { Sequelize } from 'sequelize-typescript';

export const sequelize = new Sequelize({
    database: 'ChatApp',
    dialect: 'mysql',
    username: 'root',
    password: '',
    models: [__dirname + '/models'],
});