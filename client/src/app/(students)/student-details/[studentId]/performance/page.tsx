"use client"

import { useEffect, useState } from "react";
import {Performance } from "../../../students";
import { useStudent } from "../../../../contexts/student-context";
import { useModal } from "../../../../hooks/modal/useModal";
import Modal from "../../../../custom-components/modal/modal";
import { catchError } from "@/app/routes/route_utils";
import { Course } from "@/app/(course)/course";

// This component displays and manages the performance records for a selected student.
const PerformancePage = () => {
    // State management for student, courses, performances, loading, and errors.
    const { isOpen, showModal, hideModal, message } = useModal();
    const { selectedStudent } = useStudent();
    const [courses, setCourses] = useState<Course[]>([]);
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [originalPerformances, setOriginalPerformances] = useState<Performance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

    // Handles adding a new, empty, editable row to the performance table.
    const handleAddRow = () => {
        const newRow: Performance = {
            student_id: selectedStudent.id,
            course_id: 0,
            attendance: 0,
            semester: 0,
            practical: 0,
            in_course: 0,
        };
        const newPerformances = [...performances, newRow];
        setPerformances(newPerformances);
        setEditingRowIndex(newPerformances.length - 1);
    };
    
    // Updates the state for a specific field in a row.
    const handleInputChange = <K extends keyof Performance>(
        index: number,
        field: K,
        value: Performance[K]
    ) => {
        const newPerformances = [...performances]; // 'performances' is your state array
        
        // Create a new object for the updated item to ensure immutability
        const updatedPerformance = {
            ...newPerformances[index],
            [field]: value
        };
        
        newPerformances[index] = updatedPerformance;
        setPerformances(newPerformances);
    };

    // Validates and handles changes to the course selection.
    const handleCourseChange = (index: number, courseId: number) => {
        const isDuplicate = performances.some((p, i) => i !== index && p.course_id === courseId);
        if (isDuplicate) {
            showModal("This course is already in the performance list. Please edit the existing record.");
            handleInputChange(index, 'course_id', 0); // Reset dropdown
            return;
        }
        handleInputChange(index, 'course_id', courseId);
    };

    // Saves a new or updated performance record to the database.
    const handleSave = async (index: number) => {
        const performance = performances[index];
        const isNew = !originalPerformances.find(p => p.course_id === performance.course_id && p.student_id === performance.student_id);

        try {
            const response = await fetch(isNew ? '/routes/add-performance' : '/routes/update-performance', {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(performance),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save performance');
            }

            const savedPerformance: Performance = await response.json();
            const newPerformances = [...performances];
            newPerformances[index] = savedPerformance;
            setPerformances(newPerformances);
            setOriginalPerformances(newPerformances); // Update original state
            setEditingRowIndex(null); // Exit editing mode
        } catch (error: unknown) {
            catchError(error, "Error caught from client side add-performance. Reason: ", "Error caught from client side add-performance.");
        }
    };

    // Enables editing for a specific row.
    const handleEdit = (index: number) => {
        if(editingRowIndex == null) {
            setEditingRowIndex(index);
        } else {
            showModal(
                `Please complete / cancel editing on the current row (row no. ${editingRowIndex + 1}) before editing this row.`,
                () => {}
            );
        }
    };

    // Deletes a performance record from the database.
    const handleDelete = async (index: number) => {
        if(editingRowIndex != null) {
            showModal(
                `Please complete / cancel editing on the current row (row no. ${editingRowIndex + 1}) before editing this row.`,
                () => {}
            )
        } else {
            const performance = performances[index];
            try {
                const response = await fetch('/routes/delete-performance', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: performance.student_id, course_id: performance.course_id }),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to delete performance');
                }
                const newPerformances = performances.filter((_, i) => i !== index);
                setPerformances(newPerformances);
                setOriginalPerformances(newPerformances);
            } catch (error: unknown) {
                catchError(error, "Failed to delete Performance: ", "Failed to delete Performance Record for unknown reason.");
            }
        }
    };

    // Cancels the editing process, reverting changes or removing a new row.
    const handleCancel = (index: number) => {
        const performance = performances[index];
        // If it's a new row that hasn't been saved, remove it
        if (!originalPerformances.find(p => p.course_id === performance.course_id && p.student_id === performance.student_id)) {
            setPerformances(performances.filter((_, i) => i !== index));
        } else {
            // Otherwise, revert to original state
            const revertedPerformances = [...performances];
            revertedPerformances[index] = originalPerformances[index];
            setPerformances(revertedPerformances);
        }
        setEditingRowIndex(null);
    };

    // Effect to fetch initial data (courses and student's performances).
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedStudent || !selectedStudent.id) {
                setLoading(false);
                setError("No student selected. Please go to the student list and select a student.");
                return;
            }

            try {
                const response = await fetch('/routes/get-courses-and-student-performance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: selectedStudent.id }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch data");
                }

                const data = await response.json();
                setCourses(data.courses);
                setPerformances(data.performances);
                setOriginalPerformances(data.performances as Performance[]); // Store original state for cancel functionality
            } catch (error: unknown) {
                catchError(
                    error, 
                    "Error caught during get-courses-and-student-performance. Reason: ", 
                    "Error caught during get-courses-and-student-performance"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [selectedStudent]);

    // Render loading state
    if(loading) {
        return (
            <main className="flex flex-col items-center">
                {error && <p className="text-destructive">Error: {error} </p>}
                {!error && <p className="text-textprimary">Loading...</p>}
            </main>
        );
    }

    // Render error state
    if (error) {
        return <div className={`p-4 text-center text-destructive`}>{error}</div>;
    }

    // Main component render
    return (
        <div className="p-4">
            <Modal isOpen={isOpen} onClose={hideModal} message={message} />
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-textprimary">Student Performance</h1>
                <button
                    onClick={handleAddRow}
                    className="py-2 px-4 bg-primary hover:bg-primary/90 rounded-lg shadow-md text-textprimary font-bold focus:outline-none focus:ring-1 focus:ring-primary transition duration-150 ease-in-out"
                >
                    + Add Performance
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-surface">
                        <tr>
                            <th className="px-6 py-3">No.</th>
                            <th className="px-6 py-3">Course Name</th>
                            <th className="px-6 py-3">Description</th>
                            <th className="px-6 py-3">Attendance</th>
                            <th className="px-6 py-3">Semester</th>
                            <th className="px-6 py-3">Practical</th>
                            <th className="px-6 py-3">In-course</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {performances.map((p, index) => {
                            const course = courses.find(c => c.id === p.course_id);
                            const isEditing = editingRowIndex === index;

                            return (
                                <tr key={index} className="border-b border-subtle hover:bg-surface/10">
                                    <td className="px-6 py-4">
                                        {index+1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <select
                                                value={p.course_id}
                                                onChange={(e) => handleCourseChange(index, parseInt(e.target.value))}
                                                className="w-full p-1 border-subtle border-2 rounded-md bg-surface focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                                <option value={0} disabled>--Select--</option>
                                                {courses.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            course?.name
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{course?.description}</td>
                                     {/* Render inputs for editable fields */}
                                    {['attendance', 'semester', 'practical', 'in_course'].map(field => (
                                        <td key={field} className="px-6 py-4">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={p[field as keyof Performance] === 0 ? '' : p[field as keyof Performance]}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const numericValue = value === '' ? 0 : parseFloat(value);
                                                        if (!isNaN(numericValue)) {
                                                            handleInputChange(index, field as keyof Performance, numericValue);
                                                        }
                                                    }}
                                                    className="w-20 p-1 border-subtle border-2 rounded-md bg-surface no-arrows focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            ) : (
                                                p[field as keyof Performance]
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-center">
                                        {
                                            isEditing ? (
                                                <>
                                                    <button onClick={() => handleSave(index)} className="font-medium text-success hover:underline disabled:text-disabled disabled:no-underline">Save</button>
                                                    <button onClick={() => handleCancel(index)} className="font-medium text-textsecondary hover:underline ml-4 disabled:text-disabled disabled:no-underline">Cancel</button>
                                                </>
                                            ) : (<></>)
                                        }
                                        {
                                            (!isEditing && p.course_id) ? (
                                                <>
                                                    <button onClick={() => handleEdit(index)} className="font-medium text-primary hover:underline disabled:text-disabled disabled:no-underline">Edit</button>
                                                    <button onClick={() => handleDelete(index)} className="font-medium text-destructive hover:underline ml-4 disabled:text-disabled disabled:no-underline">Delete</button>
                                                </>
                                            ) : (<></>)
                                        }
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PerformancePage;