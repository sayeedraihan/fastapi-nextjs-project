"use client"

import { useRouter } from "next/navigation";
import { useStudent } from "@/app/contexts/student-context";
import { handleTableRowClickEvent } from "@/app/(students)/students";

export type DataCellProps = {
    cellData?: string;
    studentId: number;
    clickable?: boolean;
}

const DataCell = ({cellData, studentId, clickable}: DataCellProps) => {
    const router = useRouter();
    const { setSelectedStudent } = useStudent();

    return (
        <td 
            onClick={clickable ? () => {handleTableRowClickEvent(studentId, setSelectedStudent, router)} : (() => {})} 
            className={`
                border-subtle border-2 
                ${clickable ? "hover:cursor-pointer" : ""}
            `}
        >
            <span>{cellData}</span>
        </td>
    )
}

export default DataCell;