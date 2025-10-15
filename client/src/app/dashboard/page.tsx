"use client"

import { useEffect, useState } from "react";
import AdminDashboard from "./adminDashboard";
import StudentDashboard from "./studentDashboard";
import { AdminDashboardResponse, StudentDashboardResponse } from "./dashboard";
import { catchError } from "../routes/route_utils";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | StudentDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch("/routes/dashboard", {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch dashboard data");
                }
                const data = await response.json();
                setDashboardData(data);
            } catch (error: unknown) {
                catchError(error, "Error fetching dashboard data: ", "Unknown error fetching dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    if (!dashboardData) {
        return <p>No dashboard data available.</p>;
    }

    return (
        <div className="p-4">
            {dashboardData.role === "A" && <AdminDashboard data={dashboardData as AdminDashboardResponse} />}
            {dashboardData.role === "S" && <StudentDashboard data={dashboardData as StudentDashboardResponse} />}
        </div>
    );
};

export default Dashboard;