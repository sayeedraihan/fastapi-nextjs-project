import Modal from "@/app/custom-components/modal/modal";
import { Student } from "../../../contexts/student-context";
import TableBody from "./body/body"
import TableHeader from "./header/header"

import { useModal } from "@/app/hooks/modal/useModal";
import { useStudentList } from "@/app/contexts/student-list-context";
import { useState } from "react";
import { StudentDeleteParams } from "./row/row";

export type TableProps = {
    columnHeaders: string[];
    tableData: Student[];
}

const Table = ({columnHeaders, tableData}: TableProps) => {
    const { totalStudentList, setTotalStudentList } = useStudentList();
    const { 
        isOpen: isConfirmOpen, 
        showModal: showConfirmModal, 
        hideModal: hideConfirmModal, 
        message: confirmMessage 
    } = useModal();
    const { 
        isOpen: isSuccessOpen, 
        showModal: showSuccessModal, 
        hideModal: hideSuccessModal, 
        message: successMessage 
    } = useModal();
    const [ studentIdToDelete, setStudentIdToDelete ] = useState<string>("0")

    const handleDeleteCLick = (idToDelete: string) => {
        setStudentIdToDelete(idToDelete);
        showConfirmModal("Are you sure about deleting this record?");
    }
    const confirmDeleteClick = async(id: string) => {
        hideConfirmModal();
        try {
            const deleteParams: StudentDeleteParams = {
                id: id
            }
            const response = await fetch(`/routes/delete-student-by-id`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(deleteParams),
            });

            if(!response.ok) {
                throw new Error("Failed to delete student with ID: " + id + ". Reason: " + response.body);
            }
            setTotalStudentList(totalStudentList.filter(student => student.id.toString() !== id));
            showSuccessModal("Record deleted successfully.");
        } catch(error: unknown) {
            if(error instanceof Error) {
                throw new Error("Caught error during deleting student with ID: " + id + ". Reason: " + error.message);
            } else {
                throw new Error("Caught error during deleting student with ID: " + id + ". Reason unknown.");
            }
        } finally {
            setStudentIdToDelete("0");
        }
    }

    return (
        <>
            <Modal
                isOpen={isConfirmOpen}
                onOk={() => {
                    confirmDeleteClick(studentIdToDelete)
                }}
                onClose={hideConfirmModal}
                message={confirmMessage}
                showCancelButton={true}
            />
            <Modal
                isOpen={isSuccessOpen}
                onClose={hideSuccessModal}
                message={successMessage}
                // showCancelButton={false}
            />
            <table className="w-full text-sm text-left">
                <TableHeader columnHeaders={columnHeaders}/>
                <TableBody 
                    tableData={tableData} 
                    onRowDeleteClick={ handleDeleteCLick }
                />
            </table>
        </>
    )
}

export default Table;