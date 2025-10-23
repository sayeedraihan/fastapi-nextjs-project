"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePathname, useSearchParams } from "next/navigation"

import Table from "./table/table"
import { FilterPayload, StudentListResponse } from "../students"
import Filter from "./filter/page"
import { catchError } from "@/app/routes/route_utils"
import { useAuth } from "@/app/contexts/auth-context"
import { useStudent } from "../../contexts/student-context"

const StudentList = () => {
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ warning, setWarning ] = useState<string | null>(null);
    const [ totalPage, setTotalPage ] = useState<number>(1);
    const { resultantStudentList, setResultantStudentList } = useStudent();
    const { role, loading: authLoading } = useAuth();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const property = searchParams.get("property") || "id";
    const value = searchParams.get("value") || "";
    const currentFilters: FilterPayload = {
        property: property,
        value: value,
        activeFilter: !!(searchParams.get("property") && searchParams.get("value"))
    };

    const updateQueryParams = useCallback((newParams: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams);
        Object.entries(newParams).forEach(([key, value]) => {
            const val = String(value);
            if (val) {
                params.set(key, val);
            } else {
                params.delete(key);
            }
        });
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    const handleFilterChange = (payload: FilterPayload) => {
        updateQueryParams({
            page: 1,
            property: payload.property || "",
            value: payload.value || ""
        });
    }

    const handleLimitChange = (newLimit: number) => {
        updateQueryParams({
            page: 1,
            limit: newLimit
        });
    };

    const goToPreviousPage = () => updateQueryParams({ page: page - 1 });
    const goToNextPage = () => updateQueryParams({ page: page + 1 });

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams(searchParams);
            if (!params.has("page")) params.set("page", "1");
            if (!params.has("limit")) params.set("limit", "10");

            const currentPage = parseInt(params.get("page") || "1");

            try {
                const response: Response = await fetch(`/routes/get-paginated-student-list?${params.toString()}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });

                if(!response.ok) {
                    throw new Error("Failed to fetch students. Please ensure that the backend is running.");
                } else {
                    const studentListResponse: StudentListResponse = await response.json();
                    setWarning(studentListResponse.message ?? null);
                    if(studentListResponse.message && studentListResponse.message.length > 0) {
                        setResultantStudentList([]);
                    } else {
                        setResultantStudentList(studentListResponse.students ?? []);
                    }
                    setTotalPage(studentListResponse.page_count ?? 1);
                }
            } catch (error: unknown) {
                catchError(error, "error.message: ", "Unknown error caught at /student-list/page.tsx catch statement.");
            } finally {
                setLoading(false);
            }
        }

        fetchStudents();
    }, [searchParams, setResultantStudentList]);

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
            <Filter currentFilters={ currentFilters } onFilterChange={handleFilterChange} />

            {warning && (
                <p className="text-center text-destructive mt-4">{warning}</p>
            )}

            {!warning && resultantStudentList.length === 0 && (
                <p className="text-center text-textsecondary mt-4">No students found matching the criteria.</p>
            )}
            {resultantStudentList.length > 0 ? (
                <Table columnHeaders={columnHeaders} tableData={resultantStudentList}></Table>
            ) : (
                <p className="text-center text-textsecondary mt-4">No students found matching the criteria.</p>
            )}

            <div className="flex justify-between items-center gap-20 mt-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="limit" className="text-textprimary">Students per page:</label>
                    <select
                        id="limit"
                        value={limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="p-2 border-subtle border-2 rounded-md bg-surface text-textprimary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={goToPreviousPage}
                        disabled={page <= 1 || totalPage == 1}
                        className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg text-textprimary font-bold disabled:bg-disabled disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-textprimary">
                        Page {page} of {totalPage}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={page >= totalPage || totalPage == 1}
                        className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg text-textprimary font-bold disabled:bg-disabled disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StudentList;