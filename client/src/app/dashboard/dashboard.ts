import { Student, Performance } from "../(students)/students";

export type BaseRequestResponse = {
    message?: string;
}

export type DashboardRequestResponse = {
    role: string;
} & BaseRequestResponse;

export type AdminDashboardResponse = {
    students_per_class?: { [key: string]: number };
    students_per_course?: { [key: string]: number };
} & DashboardRequestResponse;

export type StudentDashboardResponse = {
    student: Student;
    performances: Performance[];
} & DashboardRequestResponse;