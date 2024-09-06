import User from "./User";
import Group from "./Group";
import UserGroup from "./UserGroup";

const setAssociations = () =>{
    User.belongsToMany(Group, { through: UserGroup });
    Group.belongsToMany(User, { through: UserGroup });
}

export default setAssociations;