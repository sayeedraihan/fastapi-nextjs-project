"use client"

import { useEffect, useState } from "react"
import { Student, useStudent } from "../../contexts/student-context"

import Table from "./table/table"
import { FilterPayload, StudentListRequest, StudentListResponse } from "../students"
import Filter from "./filter/page"
import { catchError } from "@/app/routes/route_utils"
import { useAuth } from "@/app/contexts/auth-context"

const StudentList = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ limit, setLimit ] = useState<number>(10);
    const [ page, setPage ] = useState<number>(1);
    const [ totalPage, setTotalPage ] = useState<number>(1);
    const [ currentFilters, setCurrentFilters ] = useState<FilterPayload>( { filter: null, value: null} );
    const { resultantStudentList, setResultantStudentList } = useStudent();
    const { role, loading: authLoading } = useAuth();

    const handleFilterChange = (payload: FilterPayload) => {
        setPage(1);
        setCurrentFilters(payload);
    }

    const goToPreviousPage = () => setPage(p => Math.max(1, p - 1));
    const goToNextPage = () => setPage(p => Math.min(totalPage, p + 1));

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);
            const request: StudentListRequest = {
                page: page,
                limit: limit,
                filter: currentFilters.filter || undefined,
                value: currentFilters.value || undefined
            }
            try {
                const response: Response = await fetch("/routes/get-paginated-student-list", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(request)
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch students. Please ensure that the backend is running.");
                } else {
                    const objects: StudentListResponse = await response.json();
                    setResultantStudentList(objects.students ?? []);
                    setTotalPage(objects.page_count ?? 1);
                }
            } catch (error: unknown) {
                catchError(error, "error.message: ", "Unknown error caught at /student-list/page.tsx catch statement.");
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, [page, limit, currentFilters, setResultantStudentList]);

    if (authLoading) {
         return <p className="p-4 text-center">Authenticating...</p>;
    }

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
            <Filter onFilterChange={handleFilterChange} />
            {resultantStudentList.length > 0 ? (
                <Table columnHeaders={columnHeaders} tableData={resultantStudentList}></Table>
            ) : (
                <p className="text-center text-textsecondary mt-4">No students found matching the criteria.</p>
            )}


            {/* --- ADD PAGINATION CONTROLS --- */}
            {totalPage > 1 && ( // Only show pagination if there's more than one page
                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={goToPreviousPage}
                        disabled={page <= 1}
                        className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg text-textprimary font-bold disabled:bg-disabled disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-textprimary">
                        Page {page} of {totalPage}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={page >= totalPage}
                        className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg text-textprimary font-bold disabled:bg-disabled disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default StudentList;