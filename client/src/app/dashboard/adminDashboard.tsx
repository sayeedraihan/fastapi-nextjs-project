import { AdminDashboardResponse } from "./dashboard";

const AdminDashboard = ({ data }: { data: AdminDashboardResponse }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold">Students per Class</h3>
                    <ul>
                        {data.students_per_class && Object.entries(data.students_per_class).map(([className, count]) => (
                            <li key={className}>{className}: {count}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Students per Course</h3>
                    <ul>
                        {data.students_per_course && Object.entries(data.students_per_course).map(([courseName, count]) => (
                            <li key={courseName}>{courseName}: {count}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;