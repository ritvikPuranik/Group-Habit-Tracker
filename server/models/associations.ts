import User from "./User";
import Group from "./Group";
import UserGroup from "./UserGroup";
import Message from "./Message";

const setAssociations = () =>{
    console.log("setting associations>");
    User.belongsToMany(Group, { through: UserGroup });
    User.hasMany(Message, { foreignKey: 'sender_id' });

    Group.belongsToMany(User, { through: UserGroup });
    Group.hasMany(Message, { foreignKey: 'group_id' });
}

export default setAssociations;