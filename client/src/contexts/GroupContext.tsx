import React, { createContext, useContext, useState } from "react";
const GroupContext: any = createContext(null);

export const useGroupContext = () => useContext(GroupContext);

interface GroupToken {
    id: number,
    name: string,
    admin: number
}
export const GroupContextProvider = ({ children }) => {
    let token: GroupToken = {id: 0, name: '', admin: 0};
    const [groupDetails, setGroupDetails] = useState(token);

    const setGroupToken = (tokenData) => {
        setGroupDetails(tokenData);
    };

    return (
        <GroupContext.Provider value={{ groupDetails, setGroupToken }}>
            {children}
        </GroupContext.Provider>
    );
};