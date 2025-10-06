"use client"

import { createContext, ReactNode, useContext, useState } from "react";

type UtilsObject = {
    levels: { [key: string]: string }[];
    mediums: { [key: string]: string }[];
    fields: { [key: string]: string }[];
}

type UtilsObjectContextType = {
    utilsObject: UtilsObject;
    setUtilsObject: (utilsObject: UtilsObject) => void;
}

const UtilsObjectContext = createContext<UtilsObjectContextType>({ 
    utilsObject: { 
        levels: [], 
        mediums: [], 
        fields: [] 
    }, 
    setUtilsObject: () => {} 
});

const UtilsObjectContextProvider = ({ 
    children
} : {
    children : ReactNode
}) => {
    const [ utilsObject, setUtilsObject ] = useState<UtilsObject>({ levels: [], mediums: [], fields: [] });
    return (
        <UtilsObjectContext.Provider value={{ utilsObject, setUtilsObject }}>
            {children}
        </UtilsObjectContext.Provider>
    )
}

const useUtilsObject = () => {
    const context = useContext(UtilsObjectContext);
    if (!context) {
        throw new Error("useUtilsObject must be used inside of the Utils Object provider");
    }
    return context;
}

export { UtilsObjectContextProvider, useUtilsObject }
export type { UtilsObject }
