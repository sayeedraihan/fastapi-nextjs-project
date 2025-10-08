"use client"

import { Student, useStudent } from "@/app/contexts/student-context";
import React, { JSX, useEffect, useRef, useState } from "react"
import { fetchStudentById, StudentUpdateResponseParams } from "../../students";

import { useUtilsObject } from "@/app/contexts/utils_context";

import { useModal } from "@/app/hooks/modal/useModal";
import Modal from "@/app/custom-components/modal/modal";
import { useRouter } from 'next/navigation';

export type StudentDetailsParams = {
    studentId: string;
}

export type UpdateStudentParams = {
    studentId: string;
}

const StudentDetails = ({ 
    params 
} : {
    params: Promise<StudentDetailsParams>
}) : JSX.Element => {
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<string | null>(null);
    const [ student, setStudent ] = useState<Student>({ id: -1 });
    const [ updatedStudent, setUpdatedStudent ] = useState<Student>( { id: -1 } );
    const [ isUpdateButtonDisabled, setUpdateButtonDisabled ] = useState<boolean>(true);
    const [ warningMessage, setWarningMessage ] = useState("");
    const { originalStudentList, selectedStudent, setSelectedStudent } = useStudent();
    const { utilsObject } = useUtilsObject();
    const { isOpen, showModal, hideModal } = useModal();
    const studentNameInputRef = useRef<HTMLInputElement>(null);
    const studentRollInputRef = useRef<HTMLInputElement>(null);
    const studentLevelSelectRef = useRef<HTMLSelectElement>(null);
    const studentSectionInputRef = useRef<HTMLInputElement>(null);
    const studentMediumSelectRef = useRef<HTMLSelectElement>(null);
    const router = useRouter();

    const resolvedParams = React.use(params);
    const studentId = resolvedParams.studentId;
    const levels = utilsObject.levels;
    const mediums = utilsObject.mediums;

    const checkForDuplicateRoll = (): boolean => {
        const newRoll = studentRollInputRef.current? parseInt(studentRollInputRef.current.value) : 0;
        if(newRoll <= 0) {
            setWarningMessage("The Roll Number is invalid. Please re-insert the value");
            return true;
        }
        for(let i = 0; i < originalStudentList.length; i++) {
            if(originalStudentList[i].roll == newRoll && student.id !== originalStudentList[i].id) {
                setWarningMessage("The Roll Number already exists in the Database. Please change the Roll.");
                return true;
            }
        }
        return false;
    }

    const checkForInvalidName = (): boolean => {
        const newName = studentNameInputRef.current ? studentNameInputRef.current.value : "";
        if(/\d/.test(newName)) {
            setWarningMessage("The Name is invalid. Please change the name.");
            return true;
        }
        return false;
    }

    const checkForInformationValidity = () => {
        if(checkForDuplicateRoll() || checkForInvalidName()) {
            showModal(warningMessage);
            return false;
        }
        setWarningMessage("");
        return true;
    }

    useEffect(() => {
        fetchStudentById(studentId, setSelectedStudent, setStudent, setError, setLoading, setUpdatedStudent);
    }, [studentId, setSelectedStudent]);

    useEffect(() => {
        const noChangeDone = (): boolean => {
            return (
                selectedStudent.id === updatedStudent.id
                && selectedStudent.name === updatedStudent.name 
                && selectedStudent.roll === updatedStudent.roll
                && selectedStudent.level === updatedStudent.level 
                && selectedStudent.section === updatedStudent.section
                && selectedStudent.medium === updatedStudent.medium
            )
        }
        if(noChangeDone() || updatedStudent.id == -1) {
            return;
        }
        const updateSelectedStudent = async() => {
            try {
                const response = await fetch(`/routes/update-student`, {
                    method: "POST",
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(updatedStudent),
                });

                if(!response.ok) {
                    const responseText = await response.json();
                    throw new Error("Failed to update student. Reason: " + responseText);
                } else {
                    const data: StudentUpdateResponseParams = await response.json();
                    setSelectedStudent(JSON.parse(data.updated_student));
                    setStudent(JSON.parse(data.updated_student));
                    setUpdatedStudent(JSON.parse(data.updated_student));
                    setWarningMessage(data.response_message);
                    showModal(data.response_message);
                }
            } catch(err: unknown) {
                if(err instanceof Error) {
                    throw new Error(err.message);
                } else {
                    throw new Error("Error message thrown from /student-details/[studentId]/page.tsx catch statement. Reason unknown.");
                }
            }
        }
        updateSelectedStudent();
    }, [updatedStudent, setSelectedStudent, selectedStudent, showModal, warningMessage]);

    const handleViewPerformanceClick = async () => {
        try {
            const response = await fetch(`/routes/get-courses-and-student-performance`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ student_id: studentId }),
            });

            if (!response.ok) {
                const responseText = await response.json();
                throw new Error("Failed to fetch performance data. Reason: " + responseText);
            } else {
                // Redirect to the performance page
                router.push(`/student-details/${studentId}/performance`);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred while fetching performance data.");
            }
        }
    };

    const handleUpdateButtonclick = () => {
        if(selectedStudent.id < 0) {
            setLoading(false);
            setError("Updated Student has an invalid ID.");
            return;
        }
        if(checkForInformationValidity()) {
            const changedStudentData: Student = {
                id: student.id,
                name: studentNameInputRef.current ? studentNameInputRef.current.value : "",
                roll: studentRollInputRef.current ? parseInt(studentRollInputRef.current.value) : -1,
                level: studentLevelSelectRef.current ? studentLevelSelectRef.current.value : "",
                section: studentSectionInputRef.current ? studentSectionInputRef.current.value : "",
                medium: studentMediumSelectRef.current ? studentMediumSelectRef.current.value : ""
            }
            setUpdatedStudent(changedStudentData);
        }
    }

    const onValueChanged = (current: HTMLInputElement | HTMLSelectElement | null, currentValue: string | number | undefined) => {
        if(current && current.value === currentValue) {
            setUpdateButtonDisabled(true);
        } else if(isUpdateButtonDisabled) {
            setUpdateButtonDisabled(false);
        }
    }

    if(loading) {
        return (
            <main className="flex flex-col items-center">
                {error && <p className="text-destructive">Error: {error} </p>}
                {!error && <p className="text-textprimary">Loading...</p>}
            </main>
        );
    }

    if(error) {
        return <main className="flex flex-col items-center"><p className="text-destructive">Error: {error}</p></main>;
    }

    // 3. Render using the local 'student' state to ensure the full, correct data is displayed.
    if (!student) {
        return <p>Student not found.</p>
    }

    return (
        <div>
            <Modal isOpen={isOpen} onClose={hideModal} message={warningMessage} />
            {/* Link to performance page */}
            <div className="flex justify-center my-4">
                <button onClick={handleViewPerformanceClick} className="text-primary hover:underline">
                    View Performance
                </button>
            </div>
            <div>
                <span className="text-3xl font-bold flex justify-center">Student ID: {student.id}</span>
            </div>
            <br />
            <div className="flex flex-col items-center">
                <div className="flex flex-row justify-normal">
                    <label htmlFor="name" className="pr-2 mt-1 ml-4">Name: </label>
                    <input
                        id="name"
                        type="text"
                        defaultValue={student.name}
                        ref={studentNameInputRef}
                        onChange={() => {onValueChanged(studentNameInputRef.current, student.name)}}
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                    />
                </div>
                <br />
                <div className="flex flex-row justify-normal">
                    <label htmlFor="roll" className="pr-2 mt-1 ml-8">Roll: </label>
                    <input
                        id="roll"
                        type="text"
                        defaultValue={student.roll}
                        ref={studentRollInputRef}
                        onChange={() => {onValueChanged(studentRollInputRef.current, student.roll?.toString())}}
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                    />
                </div>
                <br />
                <div className="flex flex-row justify-normal">
                    <label htmlFor="level" className="pr-2 mt-1 ml-6">Class: </label>
                    <select
                        id="level"
                        ref={studentLevelSelectRef}
                        onChange={() => {onValueChanged(studentLevelSelectRef.current, student.level)}}
                        defaultValue={student.level} 
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                        >
                        <option value="" disabled>--Please choose an option--</option>
                        {levels.map((level, index) => {
                            const [key, value] = Object.entries(level)[0];
                            return (
                                <option key={"level" + index} value={value}>
                                    {key}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <br />
                <div className="flex flex-row justify-normal">
                    <label htmlFor="section" className="pr-2 mt-1 ml-2">Section: </label>
                    <input
                        id="section"
                        type="text"
                        defaultValue={student.section}
                        ref={studentSectionInputRef}
                        onChange={() => {onValueChanged(studentSectionInputRef.current, student.section)}}
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                    />
                </div>
                <br />
                <div className="flex flex-row justify-normal">
                    <label htmlFor="medium" className="pr-2 mt-1">Medium: </label>
                    <select
                        id="medium"
                        ref={studentMediumSelectRef}
                        onChange={() => {onValueChanged(studentMediumSelectRef.current, student.level)}}
                        defaultValue={student.medium} 
                        className="
                            ml-1 
                            p-1 
                            w-60 
                            border-subtle border-2 rounded-md 
                            focus:outline-none focus:ring-1 focus:ring-primary 
                            bg-surface 
                        "
                    >
                        <option value="" disabled>--Please choose an option--</option>
                        {mediums.map((medium, index) => {
                            const [key, value] = Object.entries(medium)[0];
                            return (
                                <option key={"medium" + index} value={value}>
                                    {key}
                                </option>
                            )
                        })}
                    </select>
                </div>
                <br /><br />
                <button 
                    onClick={handleUpdateButtonclick} 
                    disabled={isUpdateButtonDisabled} 
                    className="
                        py-2 px-2 
                        mx-2 
                        bg-primary hover:bg-primary/90 rounded-lg shadow-md 
                        text-textprimary font-bold 
                        focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                        transition duration-150 ease-in-out
                    "
                >
                    Update Student Data
                </button>
            </div>
        </div>
    )
}

export default StudentDetails