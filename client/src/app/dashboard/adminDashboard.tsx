"use client"

import { AdminDashboardResponse } from "./dashboard";
import { useEffect, useState } from "react";
import { catchError } from "../routes/route_utils";

type EnumOption = { [key: string]: string };

const AdminDashboard = ({ data }: { data: AdminDashboardResponse }) => {
    const { students_per_class, students_per_course } = data;

    const [levelOrder, setLevelOrder] = useState<string[]>([]);

    const courseNames = students_per_course ? Object.keys(students_per_course) : [];
    const courseCounts = students_per_course ? Object.values(students_per_course) : [];

    const hasCourseData = courseNames.length > 0;

    useEffect(() => {
        const fetchLevelOrder = async () => {
            try {
                const response = await fetch("/routes/get-utils");
                if (!response.ok) {
                    throw new Error('Failed to fetch level order');
                }
                const allEnums = await response.json();
                const levelValues = (allEnums[1] as EnumOption[]).map(levelObj => Object.values(levelObj)[0]);
                setLevelOrder(levelValues);
            } catch (error: unknown) {
                catchError(error, "Error fetching enums: ", "Unknown error fetching enums");
            }
        };
        fetchLevelOrder();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Students per Class</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-surface">
                            <tr>
                                <th className="px-6 py-3 border-subtle border-2 w-48">Class</th>
                                {levelOrder.length > 0 ? (
                                    levelOrder.map(levelName => (
                                        <th key={levelName} className="px-6 py-3 border-subtle border-2">{levelName}</th>
                                    ))
                                ) : (
                                    <th className="px-6 py-3 border-subtle border-2">Loading...</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-subtle hover:bg-surface/10">
                                <td className="px-6 py-4 border-subtle border-2 font-medium w-48">Number of Students</td>

                                {levelOrder.length > 0 ? (
                                    levelOrder.map(levelName => (
                                        <td key={levelName} className="px-6 py-4 border-subtle border-2">
                                            {students_per_class ? (students_per_class[levelName] || 0) : 0}
                                        </td>
                                    ))
                                ) : (
                                    <td className="px-6 py-4 border-subtle border-2" colSpan={12}>...</td>
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">Students per Course</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-surface">
                            <tr>
                                <th className="px-6 py-3 border-subtle border-2 w-48">Course</th>
                                {hasCourseData ? (
                                    courseNames.map(courseName => (
                                        <th key={courseName} className="px-6 py-3 border-subtle border-2">{courseName}</th>
                                    ))
                                ) : (
                                    <th className="px-6 py-3 border-subtle border-2">---</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-subtle hover:bg-surface/10">
                                <td className="px-6 py-4 border-subtle border-2 font-medium w-48">Number of Students</td>
                                {hasCourseData ? (
                                    courseCounts.map((count, index) => (
                                        <td key={courseNames[index]} className="px-6 py-4 border-subtle border-2">{count}</td>
                                    ))
                                ) : (
                                    <td className="px-6 py-4 border-subtle border-2">No course enrollment data found.</td>
                                )}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;