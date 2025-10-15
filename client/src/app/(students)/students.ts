"use client"

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const enum LEVEL {
    ONE=    "one",
    TWO=    "two",
    THREE=  "three",
    FOUR=   "four",
    FIVE=   "five",
    SIX=    "six",
    SEVEN=  "seven",
    EIGHT=  "eight",
    NINE=   "nine",
    TEN=    "ten"
}

export const enum MEDIUM {
    BANGLA =    "bangla",
    ENGLISH =   "english"
}

type StudentBase = {
    name?: string;
    roll?: number;
    level?: string;
    section?: string;
    medium?: string;
}

type Student = { 
    id: number;
    user_id?: number;
} & StudentBase

type Course = {
    id: number;
    name: string;
    course_code: string;
    description: string;
    credits: number;
}

type Performance = {
    student_id: number;
    course_id: number;
    attendance: number;
    semester: number;
    practical: number;
    in_course: number;
}

type UserBase = {
    username: string;
    email: string | null;
    full_name: string | null;
    disabled: boolean | null;
    password: string | null;
    role: string | null;
}

type User = { id: number } & UserBase;

type StudentUpdateResponseParams = {
    updated_student: string;
    response_message: string;
}

type AddUserRequest = {
    username: string;
    password: string;
    student_id: number;
    role: string;
};

const convertResponseToStudentList = (objects: Student[]) => {

    const studentList: Student[] = [];
    objects.forEach((obj: Student) => {
        const student: Student = {
            id:      obj.id,
            name:    obj.name,
            roll:    obj.roll,
            level:   obj.level,
            section: obj.section,
            medium:  obj.medium
        };
        studentList.push(student)
    })
    return studentList;
}

const convertResponseToStudent = (objects: Student[]) => {
    let fetchedStudent: Student = { id: -1 }
    objects.forEach((obj: Student) => {
        fetchedStudent = {
            id:      obj.id,
            name:    obj.name,
            roll:    obj.roll,
            level:   obj.level,
            section: obj.section,
            medium:  obj.medium
        };
    });
    return fetchedStudent;
}

const fetchStudentById = async(studentId: string, 
    setSelectedStudent?: (student: Student) => void, 
    setStudent?: (student: Student) => void, 
    setError?: (err: string) => void, 
    setLoading?: (loading: boolean) => void, 
    setUpdatedStudent?: (student: Student) => void) => {
    try {
        const response: Response = await fetch(`/routes/student-details/${studentId}`, {
            method: "GET",
            headers: { "Content-Type" : "application/json" },
        });

        if(!response.ok) {
            const result = await response.text();
            throw new Error("Failed to fetch the student with ID: " + studentId + " result:  " + result);
        } else {
            const responseClone = response.clone();
            const responseText = await responseClone.text();
            const objects: Student[] = JSON.parse(responseText);
            const fetchedStudent = convertResponseToStudent(objects);
            if(setSelectedStudent) {
                setSelectedStudent(fetchedStudent);
            }
            if(setStudent) {
                setStudent(fetchedStudent);
            }
            if(setUpdatedStudent) {
                setUpdatedStudent(fetchedStudent);
            }
        }
    } catch (err: unknown) {
        if(err instanceof Error) {
            if(setError) {
                setError(err.message);
            }
        } else {
            if(setError) {
                setError("Unknown Error. Caught at students.ts catch.");
            }
        }
    } finally {
        if(setLoading) {
            setLoading(false);
        }
    }
}

const handleTableRowClickEvent = (studentId: number, setSelectedStudent: (student: Student) => void, 
    router: AppRouterInstance) => {

    setSelectedStudent({id: studentId})
    router.push(`../../../../student-details/${studentId.toString()}`);
}

export { convertResponseToStudentList, convertResponseToStudent, fetchStudentById, handleTableRowClickEvent }

export type { StudentBase, Student, Course, Performance, StudentUpdateResponseParams, AddUserRequest }
