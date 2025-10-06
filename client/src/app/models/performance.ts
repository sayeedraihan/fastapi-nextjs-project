import { Course } from "./course";
import { Performance } from "./db_models";

export type GetCoursesAndPerformanceResponse = {
    courses: Course[];
    performances: Performance[];
};