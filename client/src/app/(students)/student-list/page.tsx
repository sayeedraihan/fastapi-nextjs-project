"use client"

import { useEffect, useState } from "react"
import { Student } from "../../contexts/student-context"

import Table from "./table/table"
import { convertResponseToStudentList } from "../students"
import { useStudentList } from "@/app/contexts/student-list-context"
import Filter from "./filter/page"
import { catchError } from "@/app/routes/route_utils"

const StudentList = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error ] = useState<string | null>(null);
    const [ initialLoad, setInitialLoad ] = useState<boolean>(true);
    const { totalStudentList, setTotalStudentList } = useStudentList();

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
                    convertResponseToStudentList(objects, setTotalStudentList);
                }
            } catch (error: unknown) {
                catchError(error, "error.message: ", "Unknown error caught at /student-list/page.tsx catch statement.");
            } finally {
                setInitialLoad(false);
                setLoading(false);
            }
        }

        fetchStudents();
    });

    if(loading) {
        return (
            <main className="flex flex-col items-center">
                {error && <p className="text-destructive">Error: {error} </p>}
                {!error && <p className="text-textprimary">Loading...</p>}
            </main>
        );
    }

    const columnHeaders = ["ID", "Name", "Roll", "Class", "Section", "Medium", "Actions"];
    return (
        <div className="mx-2 py-2 flex flex-col">
            <Filter />
            <Table columnHeaders={columnHeaders} tableData={totalStudentList}></Table>
        </div>
    )
}

export default StudentList;