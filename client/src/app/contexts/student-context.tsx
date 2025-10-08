"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import { Student } from "../(students)/students";

type StudentContextType = {
    originalStudentList: Student[];
    setOriginalStudentList: (students: Student[]) => void;
    resultantStudentList: Student[];
    setResultantStudentList: (students: Student[]) => void;
    selectedStudent: Student;
    setSelectedStudent: (student: Student) => void;
}

const StudentContext = createContext<StudentContextType>({ 
    originalStudentList: [],
    setOriginalStudentList: () => {},
    resultantStudentList: [],
    setResultantStudentList: () => {},
    selectedStudent: { id: 0 }, 
    setSelectedStudent: () => {} 
});

const StudentContextProvider = ({
    children
} : {
    children: ReactNode
}) => {
    const [ originalStudentList, setOriginalStudentList ] = useState<Student[]>([]);
    const [ resultantStudentList, setResultantStudentList ] = useState<Student[]>([]);
    const [ selectedStudent, setSelectedStudent ] = useState<Student>({
        id: 0
    });

    return (
        <StudentContext.Provider value={{
            originalStudentList, 
            setOriginalStudentList, 
            resultantStudentList, 
            setResultantStudentList, 
            selectedStudent, 
            setSelectedStudent
        }}>
            {children}
        </StudentContext.Provider>
    )
}

const useStudent = (() => {
    const context = useContext(StudentContext);
    if(!context) {
        throw new Error("useStudent must be used inside of the Student Provider");
    }
    return context;
});

export { StudentContextProvider, useStudent }
export type { Student }