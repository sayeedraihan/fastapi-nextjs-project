import { Course } from "../(course)/course";
import { Performance } from "../(students)/students";

export type GetCoursesAndPerformanceResponse = {
    courses: Course[];
    performances: Performance[];
};