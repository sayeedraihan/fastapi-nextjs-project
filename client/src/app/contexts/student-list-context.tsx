"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import { Student } from "../(students)/students";

type StudentListContextType = {
    totalStudentList: Student[];
    setTotalStudentList: (studentList: Student[]) => void;
}

const StudentListContext = createContext<StudentListContextType | null>({ 
    totalStudentList: [], 
    setTotalStudentList: () => {} 
});

const StudentListContextProvider = ({
    children
} : {
    children: ReactNode
}) => {
    const [ totalStudentList, setTotalStudentList ] = useState<Student[]>([]);

    return (
        <StudentListContext.Provider value={{totalStudentList, setTotalStudentList}}>
            {children}
        </StudentListContext.Provider>
    )
}

const useStudentList = (() => {
    const context = useContext(StudentListContext);
    if(!context) {
        throw new Error("useStudent must be used inside of the Student Provider");
    }
    return context;
});

export { StudentListContextProvider, useStudentList }