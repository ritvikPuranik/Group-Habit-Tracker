import React, { createContext, useContext, useState } from "react";
const AuthContext: any = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    let token: {id: number, email: string} = JSON.parse(sessionStorage.getItem('token') || '{}') || { id: 0, email:'' };
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