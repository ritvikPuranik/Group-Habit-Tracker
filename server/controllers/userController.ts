import User from "../models/User";
import Group from "../models/Group";

interface User{
    id: number,
    email: string,
    password: string,
    first_name: string
}

class Users{
    static createNew = async(email: string, password: string, name: string): Promise<number>  =>{
        try {
            const [user, created] = await User.findOrCreate({ where: { email }, defaults: { password: password, first_name: name } });
            if (created) {
                console.log('User created successfully!');
                return user.id;
            } else {
                console.log('User already exists!');
                return 0;
            }
        } catch (error) {
            console.error('Error inserting user:', error);
            return 0;
        }
    }

    //function to fetch user record by email in sequelize
    static getUser = async(filter: any): Promise<User | null> => {
        try {
            const user = await User.findOne({ 
                where: filter,
                attributes: { exclude: ['createdAt', 'updatedAt'] }, // Exclude the fields
                raw: true

             });
            if(user) {
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    static getUserGroups = async(userId: number) =>{
        try {
            console.log("entered getUserGroups>", userId);
            const userWithGroups = await User.findByPk(userId, {
              include: [
                {
                  model: Group,
                  through: {
                    attributes: [], // Exclude UserGroup attributes from the result
                  },
                },
              ],
            });
            if (userWithGroups) {
              console.log(`User is part of the following groups:`, userWithGroups.groups);
              return userWithGroups.groups; // Returns an array of groups
            } else {
              console.log('User not found');
              return [];
            }
          } catch (error) {
            console.error('Error fetching user groups:', error);
            throw error;
          }

    }
}


export default Users;