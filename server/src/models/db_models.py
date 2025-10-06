import json
from typing import List, Optional

from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship, SQLModel

from src.models.course import CourseBase
from src.models.student import StudentBase

class Performance(SQLModel, table=True):
    student_id: int = Field(default = None, primary_key = True, foreign_key = "student.id")
    course_id: int = Field(default = None, primary_key = True, foreign_key = "course.id")
    attendance: float = Field(default = 0.0)
    semester: int = Field(default = 0)
    practical: int = Field(default = 0)
    in_course: int = Field(default = 0)

class Student(StudentBase, table=True):
    id: int = Field(None, primary_key=True)
    courses: Mapped[List["Course"]] = Relationship(
        back_populates="students",
        link_model=Performance
    )

    def __str__(self):
        temp_str = json.dumps(dict(self))
        return temp_str

class Course(CourseBase, table=True):
    id: Optional[int] = Field(None, primary_key=True)
    students: Mapped[List["Student"]] = Relationship(
        back_populates="courses",
        link_model=Performance
    )
