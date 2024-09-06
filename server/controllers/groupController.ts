import Group from "../models/Group";
import User from "../models/User";

class Groups{
    static createNewGroup = async(name: string, creatorId: number): Promise<number> =>{
        try{
            const group = await Group.create({
                name: name,
                admin: creatorId
            })
            console.log("group created successfully>", group, group.id);
            await this.addUserToGroup(creatorId, group.id);
            return group.id;
        }catch(err){
            console.log("failed to create group>", err);
            return 0;
        }
    }

    static addUserToGroup = async(userId: number, groupId: number) => {
        const user = await User.findByPk(userId);
        console.log("found user>", user);
        const group = await Group.findByPk(groupId);
        console.log("found group>", group);
        if (user && group) {
        // console.log("additional methods>", Object.keys(User.prototype), "\nmore>>", Object.keys(user.__proto__));
        await user.addGroup(group, { through: { role: 'admin' } });
        console.log(`User ${userId} added to group ${groupId}`);
        } else {
          console.error('User or Group not found');
        }
    }


}
export default Groups;