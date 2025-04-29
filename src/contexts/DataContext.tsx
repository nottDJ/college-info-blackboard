
import { createContext, useContext, useState, ReactNode } from "react";

interface Student {
  id: string;
  name: string;
  regNumber: string;
  department: string;
  year: number;
  semester: number;
}

interface Attendance {
  studentId: string;
  courseCode: string;
  date: string;
  present: boolean;
}

interface Course {
  code: string;
  name: string;
  department: string;
  facultyId: string;
  maxHours: number;
}

interface Mark {
  studentId: string;
  courseCode: string;
  marks: number; // Out of 60
}

interface DataContextType {
  students: Student[];
  courses: Course[];
  attendance: Attendance[];
  marks: Mark[];
  addStudent: (student: Student) => void;
  removeStudent: (studentId: string) => void;
  addAttendance: (attendance: Attendance) => void;
  addMark: (mark: Mark) => void;
  getStudentCourses: (studentId: string) => Course[];
  getStudentAttendance: (studentId: string, courseCode: string) => Attendance[];
  getStudentMarks: (studentId: string) => Mark[];
  getFacultyCourses: (facultyId: string) => Course[];
  getCourseTotalHours: (courseCode: string) => number;
  getCourseAttendedHours: (studentId: string, courseCode: string) => number;
  getStudentsByCourse: (courseCode: string) => Student[];
  getDepartmentStudents: (department: string) => Student[];
}

// Mock data
const MOCK_STUDENTS: Student[] = [
  {
    id: "S001",
    name: "John Student",
    regNumber: "RA2211003010280",
    department: "Computer Science",
    year: 3,
    semester: 5
  },
  {
    id: "S002",
    name: "Alice Thompson",
    regNumber: "RA2211003010281",
    department: "Computer Science",
    year: 3,
    semester: 5
  },
  {
    id: "S003",
    name: "Bob Johnson",
    regNumber: "RA2211003010282",
    department: "Computer Science",
    year: 3,
    semester: 5
  }
];

const MOCK_COURSES: Course[] = [
  {
    code: "CS101",
    name: "Introduction to Programming",
    department: "Computer Science",
    facultyId: "F001",
    maxHours: 50
  },
  {
    code: "CS205",
    name: "Data Structures",
    department: "Computer Science",
    facultyId: "F001",
    maxHours: 50
  },
  {
    code: "CS301",
    name: "Algorithms",
    department: "Computer Science",
    facultyId: "F001",
    maxHours: 50
  },
  {
    code: "CS401",
    name: "Database Systems",
    department: "Computer Science",
    facultyId: "F002",
    maxHours: 50
  },
  {
    code: "CS501",
    name: "Computer Networks",
    department: "Computer Science",
    facultyId: "F002",
    maxHours: 50
  },
  {
    code: "CS601",
    name: "Operating Systems",
    department: "Computer Science",
    facultyId: "F002",
    maxHours: 50
  }
];

const MOCK_ATTENDANCE: Attendance[] = [
  // CS101 Attendance
  { studentId: "S001", courseCode: "CS101", date: "2025-04-01", present: true },
  { studentId: "S001", courseCode: "CS101", date: "2025-04-02", present: true },
  { studentId: "S001", courseCode: "CS101", date: "2025-04-03", present: false },
  { studentId: "S001", courseCode: "CS101", date: "2025-04-04", present: true },
  { studentId: "S001", courseCode: "CS101", date: "2025-04-05", present: true },
  
  // CS205 Attendance
  { studentId: "S001", courseCode: "CS205", date: "2025-04-01", present: true },
  { studentId: "S001", courseCode: "CS205", date: "2025-04-02", present: false },
  { studentId: "S001", courseCode: "CS205", date: "2025-04-03", present: true },
  
  // More attendance records for other courses and students
];

const MOCK_MARKS: Mark[] = [
  { studentId: "S001", courseCode: "CS101", marks: 45 },
  { studentId: "S001", courseCode: "CS205", marks: 52 },
  { studentId: "S001", courseCode: "CS301", marks: 48 },
  { studentId: "S001", courseCode: "CS401", marks: 39 },
  { studentId: "S001", courseCode: "CS501", marks: 42 },
  { studentId: "S001", courseCode: "CS601", marks: 50 },
  
  { studentId: "S002", courseCode: "CS101", marks: 50 },
  { studentId: "S002", courseCode: "CS205", marks: 48 },
  { studentId: "S002", courseCode: "CS301", marks: 53 },
  
  { studentId: "S003", courseCode: "CS101", marks: 42 },
  { studentId: "S003", courseCode: "CS205", marks: 39 },
  { studentId: "S003", courseCode: "CS301", marks: 44 },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [attendance, setAttendance] = useState<Attendance[]>(MOCK_ATTENDANCE);
  const [marks, setMarks] = useState<Mark[]>(MOCK_MARKS);

  const addStudent = (student: Student) => {
    setStudents(prev => [...prev, student]);
  };

  const removeStudent = (studentId: string) => {
    setStudents(prev => prev.filter(student => student.id !== studentId));
    setAttendance(prev => prev.filter(att => att.studentId !== studentId));
    setMarks(prev => prev.filter(mark => mark.studentId !== studentId));
  };

  const addAttendance = (newAttendance: Attendance) => {
    setAttendance(prev => [...prev, newAttendance]);
  };

  const addMark = (newMark: Mark) => {
    // Check if mark already exists for this student and course
    const existingMarkIndex = marks.findIndex(
      m => m.studentId === newMark.studentId && m.courseCode === newMark.courseCode
    );

    if (existingMarkIndex !== -1) {
      // Update existing mark
      const updatedMarks = [...marks];
      updatedMarks[existingMarkIndex] = newMark;
      setMarks(updatedMarks);
    } else {
      // Add new mark
      setMarks(prev => [...prev, newMark]);
    }
  };

  const getStudentCourses = (studentId: string) => {
    // In a real app, this would query the relationship between students and courses
    // For this mock, we'll return all courses
    return courses;
  };

  const getStudentAttendance = (studentId: string, courseCode: string) => {
    return attendance.filter(
      att => att.studentId === studentId && att.courseCode === courseCode
    );
  };

  const getStudentMarks = (studentId: string) => {
    return marks.filter(mark => mark.studentId === studentId);
  };

  const getFacultyCourses = (facultyId: string) => {
    return courses.filter(course => course.facultyId === facultyId);
  };

  const getCourseTotalHours = (courseCode: string) => {
    const course = courses.find(c => c.code === courseCode);
    return course ? course.maxHours : 0;
  };

  const getCourseAttendedHours = (studentId: string, courseCode: string) => {
    const studentAttendance = attendance.filter(
      att => att.studentId === studentId && att.courseCode === courseCode && att.present
    );
    return studentAttendance.length;
  };

  const getStudentsByCourse = (courseCode: string) => {
    // In a real app, this would query the relationship between courses and students
    // For this mock, we'll return all students
    return students;
  };

  const getDepartmentStudents = (department: string) => {
    return students.filter(student => student.department === department);
  };

  return (
    <DataContext.Provider value={{
      students,
      courses,
      attendance,
      marks,
      addStudent,
      removeStudent,
      addAttendance,
      addMark,
      getStudentCourses,
      getStudentAttendance,
      getStudentMarks,
      getFacultyCourses,
      getCourseTotalHours,
      getCourseAttendedHours,
      getStudentsByCourse,
      getDepartmentStudents
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
