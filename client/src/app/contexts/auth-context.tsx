"use client"

import { createContext, ReactNode, useContext, useState, useEffect } from "react";


type AuthContextType = {
    role: string | null;
    setRole: (role: string | null) => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    role: null,
    setRole: () => {},
    loading: true,
});

const AuthContextProvider = ({
    children
} : {
    children: ReactNode
}) => {
    const [ role, setRole ] = useState<string | null>(null);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch('/api/get-user-role');
                if (response.ok) {
                    const data = await response.json();
                    setRole(data.role);
                }
            } catch (error) {
                console.error("Failed to fetch user role", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, []);

    return (
        <AuthContext.Provider value={{
            role,
            setRole,
            loading,
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