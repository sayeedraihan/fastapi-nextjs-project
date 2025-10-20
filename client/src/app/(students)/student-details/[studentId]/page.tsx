"use client"

import { Student, useStudent } from "@/app/contexts/student-context";
import React, { JSX, useEffect, useRef, useState } from "react"
import { AddUserRequest, fetchStudentById, StudentUpdateResponseParams, User } from "../../students";

import { useUtilsObject } from "@/app/contexts/utils_context";

import { useModal } from "@/app/hooks/modal/useModal";
import Modal from "@/app/custom-components/modal/modal";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/app/contexts/auth-context";

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
    const { isOpen, showModal, hideModal, message } = useModal();
    const { originalStudentList, selectedStudent, setSelectedStudent } = useStudent();
    const { role } = useAuth();
    const { utilsObject } = useUtilsObject();
    const [isCredentialsModalOpen, setCredentialsModalOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const studentNameInputRef = useRef<HTMLInputElement>(null);
    const studentRollInputRef = useRef<HTMLInputElement>(null);
    const studentLevelSelectRef = useRef<HTMLSelectElement>(null);
    const studentSectionInputRef = useRef<HTMLInputElement>(null);
    const studentMediumSelectRef = useRef<HTMLSelectElement>(null);
    const usernameInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const resolvedParams = React.use(params);
    const studentId = resolvedParams.studentId;
    const levels = utilsObject.levels;
    const mediums = utilsObject.mediums;

    const checkForDuplicateRoll = (): string | null => {
        const newRoll = studentRollInputRef.current? parseInt(studentRollInputRef.current.value) : 0;
        if(newRoll <= 0) {
            return "The Roll Number is invalid. Please re-insert the value";
        }
        for(let i = 0; i < originalStudentList.length; i++) {
            if(originalStudentList[i].roll == newRoll && student.id !== originalStudentList[i].id) {
                return "The Roll Number already exists in the Database. Please change the Roll.";
            }
        }
        return null;
    }

    const checkForInvalidName = (): string | null => {
        const newName = studentNameInputRef.current ? studentNameInputRef.current.value : "";
        if(/\d/.test(newName)) {
            return "The Name is invalid. Please change the name.";
        }
        return null;
    }

    const checkForInformationValidity = () => {
        const rollError = checkForDuplicateRoll();
        if (rollError) {
            showModal(rollError);
            return false;
        }
        const nameError = checkForInvalidName();
        if (nameError) {
            showModal(nameError);
            return false;
        }
        return true;
    }

    const handleOpenCredentialsModal = async () => {
        if (student.user_id) {
            try {
                const response = await fetch(`/routes/get-user-by-id`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: student.user_id })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch username");
                }
                const userData: User = await response.json();
                setUsername(userData.username);
            } catch (error) {
                if (error instanceof Error) {
                    showModal(error.message);
                } else {
                    showModal("An unknown error occurred while fetching user data.");
                }
                return;
            }
        } else {
            setUsername('');
        }
        if (passwordInputRef.current) passwordInputRef.current.value = ''; // Clear password field
        setShowPassword(false);
        setCredentialsModalOpen(true);
    };

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

    const handleUpdateCredentials = async () => {
        const password = passwordInputRef.current?.value || null;

        if (!username || !password) {
            showModal("Username and password are required.");
            return;
        }

        try {
            const addUserRequest: AddUserRequest = {
                username: username,
                password,
                student_id: student.id,
                role: "S",
                full_name: student.name,
            };
            const response = await fetch('/routes/update-student-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addUserRequest),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to update credentials");
            }
            
            // Refetch student data to get the new user_id
            fetchStudentById(studentId, setSelectedStudent, setStudent, setError, setLoading, setUpdatedStudent);
            
            setCredentialsModalOpen(false);
            showModal("Credentials updated successfully!");
        } catch (error: unknown) {
            if (error instanceof Error) {
                showModal(error.message);
            } else {
                showModal("An unknown error occurred.");
            }
        }
    };

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
                    method: "PUT",
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
    }, [updatedStudent, setSelectedStudent, selectedStudent, showModal]);

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

    if(error) {
        return <main className="flex flex-col items-center"><p className="text-destructive">Error: {error}</p></main>;
    }

    // 3. Render using the local 'student' state to ensure the full, correct data is displayed.
    if (!student) {
        return <p>Student not found.</p>
    }

    return (
        <div>
            <Modal isOpen={isOpen} onClose={hideModal} message={message} />
            {/* Credentials modal */}
            {isCredentialsModalOpen && (
                <div className="fixed inset-0 bg-shadowcolor flex justify-center items-center z-50">
                    <div className="bg-surface text-textprimary p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">{student.user_id ? 'Update Credentials' : 'Add Credentials'}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <label htmlFor="username" className="w-24 text-right pr-4">Username:</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={!!student.user_id}
                                    className="flex-grow p-1 border-subtle border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-surface disabled:bg-disabled disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-center">
                                <label htmlFor="password" className="w-24 text-right pr-4">Password:</label>
                                <div className="relative flex-grow">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        ref={passwordInputRef}
                                        className="w-full p-1 border-subtle border-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-surface"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 flex items-center text-sm text-textsecondary hover:text-textprimary"
                                    >
                                        {showPassword ? 'Hide' : 'Show'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                             <button
                                onClick={() => setCredentialsModalOpen(false)}
                                className="py-2 px-4 bg-destructive hover:bg-destructive/90 rounded-lg shadow-md text-textprimary font-bold focus:outline-none focus:ring-1 focus:ring-destructive focus:ring-opacity-75 transition duration-150 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateCredentials}
                                className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg shadow-md text-textprimary font-bold focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75 transition duration-150 ease-in-out"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                <div className="flex flex-row flex-nowrap justify-center items-center gap-4">
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
                    <button
                        onClick={handleOpenCredentialsModal}
                        className="
                            py-2 px-2
                            bg-primary hover:bg-primary/90 rounded-lg shadow-md
                            text-textprimary font-bold
                            focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                            transition duration-150 ease-in-out
                        "
                    >
                        {student.user_id ? 'Update Credentials' : 'Add Credentials'}
                    </button>
                </div>
            {/* Link to performance page */}
            <div className="flex justify-center my-4">
                <button 
                    onClick={handleViewPerformanceClick} 
                    className="
                        py-2 px-2
                        bg-primary hover:bg-primary/90 rounded-lg shadow-md
                        text-textprimary font-bold
                        focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                        transition duration-150 ease-in-out
                        "
                    >
                    View Performance
                </button>
            </div>
            </div>
        </div>
    )
}

export default StudentDetails