"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import { Student } from "../(students)/students";

type StudentContextType = {
    selectedStudent: Student;
    setSelectedStudent: (student: Student) => void;
}

const StudentContext = createContext<StudentContextType>({ 
    selectedStudent: { id: 0 }, 
    setSelectedStudent: () => {} 
});

const StudentContextProvider = ({
    children
} : {
    children: ReactNode
}) => {
    const [ selectedStudent, setSelectedStudent ] = useState<Student>({
        id: 0
    });

    return (
        <StudentContext.Provider value={{selectedStudent, setSelectedStudent}}>
            {children}
        </StudentContext.Provider>
    )
}

const useSelectedStudent = (() => {
    const context = useContext(StudentContext);
    if(!context) {
        throw new Error("useStudent must be used inside of the Student Provider");
    }
    return context;
});

export { StudentContextProvider, useSelectedStudent }
export type { Student }