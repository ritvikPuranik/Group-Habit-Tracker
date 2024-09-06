import React, { createContext, useContext, useState } from "react";
const AuthContext: any = createContext(null);

type AuthToken = {
    id: number,
    email: string,
    firstName: string
}
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    let token: AuthToken = {id: 0, email: '', firstName: ''};
    const [tokenDetails, setTokenDetails] = useState(token);

    const setToken = (tokenData) => {
        setTokenDetails(tokenData);
    };

    return (
        <AuthContext.Provider value={{ tokenDetails, setToken }}>
            {children}
        </AuthContext.Provider>
    );
};