"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import { Student, StudentListDetail } from "../(students)/students";

type StudentContextType = {
    originalStudentList: StudentListDetail[];
    setOriginalStudentList: (students: StudentListDetail[]) => void;
    resultantStudentList: StudentListDetail[];
    setResultantStudentList: (students: StudentListDetail[]) => void;
    selectedStudent: StudentListDetail;
    setSelectedStudent: (student: StudentListDetail) => void;
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
    const [ originalStudentList, setOriginalStudentList ] = useState<StudentListDetail[]>([]);
    const [ resultantStudentList, setResultantStudentList ] = useState<StudentListDetail[]>([]);
    const [ selectedStudent, setSelectedStudent ] = useState<StudentListDetail>({id: 0});

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