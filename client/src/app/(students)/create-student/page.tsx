"use client"

import { useStudent } from "@/app/contexts/student-context";
import { useEffect, useRef, useState } from "react"
import { Student, StudentBase } from "../students";


import { useUtilsObject } from "@/app/contexts/utils_context";
import { useModal } from "@/app/hooks/modal/useModal";
import Modal from "@/app/custom-components/modal/modal";

const demoStudent: StudentBase = { name: "", roll: 0, level: "", section: "" }

export type CreateStudentParams = {
    new_student: StudentBase;
}

const CreateStudent = () => {
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error ] = useState<string | null>(null);
    const [ student, setStudent ] = useState<StudentBase>( demoStudent );
    const [ isCreateButtonDisabled, setCreateButtonDisabled ] = useState<boolean>(true);
    const [ newStudent, setNewStudent ] = useState<StudentBase | null>( null );
    const [ warningMessage, setWarningMessage ] = useState("");
    const { originalStudentList, setSelectedStudent } = useStudent();
    const { utilsObject } = useUtilsObject();
    const { isOpen, showModal, hideModal } = useModal();

    const studentNameInputRef = useRef<HTMLInputElement>(null);
    const studentRollInputRef = useRef<HTMLInputElement>(null);
    const studentLevelSelectRef = useRef<HTMLSelectElement>(null);
    const studentSectionInputRef = useRef<HTMLInputElement>(null);
    const studentMediumSelectRef = useRef<HTMLSelectElement>(null);

    const levels = utilsObject.levels;
    const mediums = utilsObject.mediums;

    const checkForDuplicateRoll = (): boolean => {
        const newRoll = studentRollInputRef.current? parseInt(studentRollInputRef.current.value) : 0;
        if(newRoll <= 0) {
            setWarningMessage("The Roll Number is invalid. Please re-insert the value");
            return true;
        }
        for(let i = 0; i < originalStudentList.length; i++) {
            if(originalStudentList[i].roll == newRoll) {
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

    const handleCreateButtonClick = async() => {
        if(checkForInformationValidity()) {
            setNewStudent({
                name: studentNameInputRef.current ? studentNameInputRef.current.value : "",
                roll: studentRollInputRef.current ? parseInt(studentRollInputRef.current.value) : 0,
                level: studentLevelSelectRef.current ? studentLevelSelectRef.current.value : "",
                section: studentSectionInputRef.current ? studentSectionInputRef.current.value : "",
                medium: studentMediumSelectRef.current ? studentMediumSelectRef.current.value : ""
            });
        }
    }

    useEffect(() => {
        if(newStudent === null) {
            setLoading(false);
            return;
        }
        const addNewStudent = async() => {
            try {
                const response = await fetch(`/routes/add-student/`, {
                    method: "POST",
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(newStudent),
                });

                if(!response.ok) {
                    const responseText = await response.json();
                    throw new Error("Failed to update student. Reason: " + responseText);
                } else {
                    const data: Student = await response.json();
                    setSelectedStudent(data);
                    setStudent(data);
                    setCreateButtonDisabled(true);
                    const successMessage = "Successfully created a new record with id: " + data.id.toString();
                    setWarningMessage(successMessage);
                    showModal(successMessage);
                }
            } catch(err: unknown) {
                if(err instanceof Error) {
                    throw new Error(err.message);
                } else {
                    throw new Error("Error thrown from /create-student/page.tsx catch statement. Reason unknown.");
                }
            }
        }
        addNewStudent();
    }, [newStudent, setSelectedStudent, showModal]);

    const onValueChanged = (current: HTMLInputElement | HTMLSelectElement | null, currentValue: string | number | undefined, 
        propertyType: string) => {
        
        if(!isCreateButtonDisabled && current 
            && ((["name", "level", "section", "medium"].includes(propertyType) && current.value.length === 0) 
            || ("roll" === propertyType && (parseInt(current.value) <= 0 || Number.isNaN(current.value))))
        ) {
            setCreateButtonDisabled(true);
        } else if(isCreateButtonDisabled) {
            setCreateButtonDisabled(false);
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

    return (
        <div>
            <Modal 
                isOpen={isOpen} 
                onClose={hideModal} 
                message={warningMessage} 
                showCancelButton={false}
            />
            <div>
                <h1>Add a new Student</h1>
            </div>
            <div className="flex flex-col items-center">
                <div className="flex flex-row justify-normal">
                    <label htmlFor="name" className="pr-2 mt-1 ml-4">Name: </label>
                    <input
                        id="name"
                        type="text"
                        defaultValue={""}
                        ref={studentNameInputRef}
                        onChange={() => {onValueChanged(studentNameInputRef.current, student.name, "name")}}
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
                        defaultValue={""}
                        ref={studentRollInputRef}
                        onChange={() => {onValueChanged(studentRollInputRef.current, student.roll, "roll")}}
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
                        onChange={() => {onValueChanged(studentLevelSelectRef.current, student.level, "level")}}
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
                        defaultValue={""}
                        ref={studentSectionInputRef}
                        onChange={() => {onValueChanged(studentSectionInputRef.current, student.section, "section")}}
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
                        onChange={() => {onValueChanged(studentMediumSelectRef.current, student.level, "medium")}}
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
                    onClick={handleCreateButtonClick} 
                    disabled={isCreateButtonDisabled} 
                    className="
                        py-2 px-2 
                        mx-2 
                        bg-primary hover:bg-primary/90 rounded-lg shadow-md 
                        text-textprimary font-bold 
                        focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-75
                        transition duration-150 ease-in-out
                    "
                >
                    Add New Student
                </button>
            </div>
        </div>
    )
}

export default CreateStudent;