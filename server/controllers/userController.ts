import User from "../models/User";
import Group from "../models/Group";
import UserGroup from "../models/UserGroup";

type User = {
    id: number,
    email: string,
    password: string,
    first_name: string
}
type MiniUserFields = {
    id: number;
    email: string;
    firstName: string;
};


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

    //function to fetch user record by filter in sequelize
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
            // console.log("entered getUserGroups>", userId);
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

    static getAllUsers = async() =>{
        const users = await User.findAll({
            attributes:['id', 'first_name']
        });
        return users;
    }

    static addMembersToGroup = async(users: number[], groupId: number): Promise<MiniUserFields[]> =>{
        try{
            const group = await Group.findByPk(groupId);

            if (!group) {
                console.log(`Group with ID ${groupId} not found.`);
                return [];
            }

            const addedMembers: MiniUserFields[] = []; // Array to collect successfully added members

            await Promise.all(
                users.map(async (userId) => {
                    const user = await User.findByPk(userId);
            
                    if (!user) {
                        console.log(`Couldn't find user with ids> ${userId}`);
                        return [];
                    }
            
                    // Check if the user is already a member of the group
                    const isMember = await user.hasGroup(group);
            
                    if (!isMember) {
                        // Add the user to the group if they are not already a member
                        await user.addGroup(group, { through: { role: 'member' } });
                        console.log(`User with ID ${userId} added to the group.`);
                        addedMembers.push({
                            id: user.id,
                            firstName: user.first_name,
                            email: user.email
                        });
            
                    } else {
                        console.log(`User with ID ${userId} is already a member of the group.`);
                    }
                })
            );
            
            return addedMembers;

        }catch(err){
            console.log("Couldn't add to UserGroup>", err);
            return [];
        }
    }
}


export default Users;