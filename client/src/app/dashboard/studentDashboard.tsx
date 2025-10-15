import { StudentDashboardResponse } from "./dashboard";

const StudentDashboard = ({ data }: { data: StudentDashboardResponse }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
            <div>
                <h3 className="text-lg font-semibold">My Details</h3>
                <p>Name: {data.student.name}</p>
                <p>Roll: {data.student.roll}</p>
                <p>Class: {data.student.level}</p>
                <p>Section: {data.student.section}</p>
            </div>
            <div className="mt-4">
                <h3 className="text-lg font-semibold">My Enrolled Courses</h3>
                <ul>
                    {data.performances.map((performance) => (
                        <li key={performance.course_id}>Course ID: {performance.course_id}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentDashboard;