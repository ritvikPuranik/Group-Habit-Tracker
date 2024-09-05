import User from "../models/User";

interface User{
    id: number,
    email: string,
    password: string,
    first_name: string
}

class Users{
    static findOrCreate = async(email: string, password: string, name: string): Promise<number>  =>{
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
    static getUsername = async (id: number) => {
        try {
            const user = await User.findOne({ where: { id } });
            if(user) {
                return user.first_name;
            }
            return 'User not found!';
        } catch (error) {
            console.error('Error fetching user:', error);
            return 'Error fetching user!';
        }
    }
}

export default Users;