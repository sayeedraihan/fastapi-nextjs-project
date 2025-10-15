"use client"

import { createContext, ReactNode, useContext, useState } from "react";

type AuthContextType = {
    role: string | null;
    setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    role: null,
    setRole: () => {},
});

const AuthContextProvider = ({
    children
} : {
    children: ReactNode
}) => {
    const [ role, setRole ] = useState<string | null>(null);

    return (
        <AuthContext.Provider value={{
            role,
            setRole
        }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = (() => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error("useAuth must be used inside of the Auth Provider");
    }
    return context;
});

export { AuthContextProvider, useAuth }