"use client"

import { useEffect, useState } from "react"
import { Student, useStudent } from "../../contexts/student-context"

import Table from "./table/table"
import { convertResponseToStudentList } from "../students"
import Filter from "./filter/page"
import { catchError } from "@/app/routes/route_utils"
import { useAuth } from "@/app/contexts/auth-context"

const StudentList = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error ] = useState<string | null>(null);
    const [ initialLoad, setInitialLoad ] = useState<boolean>(true);
    const { resultantStudentList, setOriginalStudentList, setResultantStudentList } = useStudent();
    const { role } = useAuth();

    useEffect(() => {
        if(!initialLoad) {
            return;
        }
        const fetchStudents = async () => {
            try {
                const response: Response = await fetch("/routes/get-all-students", {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch students. Please ensure that the backend is running.");
                } else {
                    const responseClone = response.clone();
                    const responseText = await responseClone.text();
                    const objects: Student[] = JSON.parse(responseText);
                    const studentList = convertResponseToStudentList(objects);
                    setOriginalStudentList(studentList);
                    setResultantStudentList(studentList);
                }
            } catch (error: unknown) {
                catchError(error, "error.message: ", "Unknown error caught at /student-list/page.tsx catch statement.");
            } finally {
                setInitialLoad(false);
                setLoading(false);
            }
        }

        fetchStudents();
    }, [initialLoad, setOriginalStudentList, setResultantStudentList]);

    if (role !== "A") {
        return (
            <div className="p-4 text-center text-destructive">
                You do not have permission to access this resource
            </div>
        );
    }

    if(loading) {
        return (
            <main className="flex flex-col items-center">
                {error && <p className="text-destructive">Error: {error} </p>}
                {!error && <p className="text-textprimary">Loading...</p>}
            </main>
        );
    }

    // FIX: Add this block to show only the error if it exists
    if (error) {
        return (
            <main className="flex flex-col items-center p-4">
                <p className="text-destructive text-center">{error}</p>
            </main>
        );
    }

    const columnHeaders = ["ID", "Name", "Roll", "Class", "Section", "Medium", "Updated By", "Updated At", "Credentials", "Actions"];
    return (
        <div className="mx-2 py-2 flex flex-col">
            <Filter />
            <Table columnHeaders={columnHeaders} tableData={resultantStudentList}></Table>
        </div>
    )
}

export default StudentList;