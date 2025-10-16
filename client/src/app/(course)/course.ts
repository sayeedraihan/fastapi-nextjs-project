type Course = {
    id: number;
    name: string;
    course_code: string;
    description: string | null;
    credits: number | null;
};

type CourseActionParams = {
    courseId: number;
};

export type { Course, CourseActionParams }