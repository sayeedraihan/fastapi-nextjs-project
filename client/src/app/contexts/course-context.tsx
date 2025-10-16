"use client"

import { createContext, ReactNode, useContext, useState } from "react";
import { Course } from "../(course)/course";

type CourseContextType = {
    courses: Course[];
    setCourses: (courses: Course[]) => void;
    selectedCourse: Course | null;
    setSelectedCourse: (course: Course | null) => void;
}

const CourseContext = createContext<CourseContextType>({
    courses: [],
    setCourses: () => {},
    selectedCourse: null,
    setSelectedCourse: () => {},
});

const CourseContextProvider = ({ children }: { children: ReactNode }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    return (
        <CourseContext.Provider value={{
            courses,
            setCourses,
            selectedCourse,
            setSelectedCourse
        }}>
            {children}
        </CourseContext.Provider>
    );
};

const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourse must be used inside of the Course Provider");
    }
    return context;
};

export { CourseContextProvider, useCourse };