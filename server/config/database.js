import Sequelize from "sequelize";

 /**
  * Create a Sequelize instance. This can be done by passing
  * the connection parameters separately to the Sequelize constructor.
  */

//  console.log("process.env>>", process.env);
// @ts-ignore
const sequelize = new Sequelize("ChatApp", 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});
 
 /**
  * Export the Sequelize instance. This instance can now be 
  * used in the app.js file to authenticate and establish a database connection.
  */
export default sequelize;
