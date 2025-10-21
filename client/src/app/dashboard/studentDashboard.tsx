import { StudentDashboardResponse } from "./dashboard";

const StudentDashboard = ({ data }: { data: StudentDashboardResponse }) => {
    const { student, performances, courses } = data;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>

            <div className="mb-6">
                <h3 className="text-lg font-semibold">Student Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    <p><span className="font-medium text-textsecondary">Name:</span> {student.name}</p>
                    <p><span className="font-medium text-textsecondary">Class:</span> {student.level}</p>
                    <p><span className="font-medium text-textsecondary">Roll:</span> {student.roll}</p>
                    <p><span className="font-medium text-textsecondary">Section:</span> {student.section}</p>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2">My Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-surface">
                            <tr>
                                <th className="px-6 py-3 border-subtle border-2">Course Name</th>
                                <th className="px-6 py-3 border-subtle border-2">Course Code</th>
                                <th className="px-6 py-3 border-subtle border-2">Attendance</th>
                                <th className="px-6 py-3 border-subtle border-2">Semester</th>
                                <th className="px-6 py-3 border-subtle border-2">Practical</th>
                                <th className="px-6 py-3 border-subtle border-2">In-course</th>
                            </tr>
                        </thead>
                        <tbody>
                            {performances.length > 0 ? (
                                performances.map((p) => {
                                    const course = courses.find(c => c.id === p.course_id);
                                    return (
                                        <tr key={p.course_id} className="border-b border-subtle hover:bg-surface/10">
                                            <td className="px-6 py-4 border-subtle border-2">
                                                {course?.name || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 border-subtle border-2">
                                                {course?.course_code || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 border-subtle border-2">{p.attendance}</td>
                                            <td className="px-6 py-4 border-subtle border-2">{p.semester}</td>
                                            <td className="px-6 py-4 border-subtle border-2">{p.practical}</td>
                                            <td className="px-6 py-4 border-subtle border-2">{p.in_course}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="border-b border-subtle">
                                    <td colSpan={6} className="text-center px-6 py-4 border-subtle border-2">
                                        No performance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;