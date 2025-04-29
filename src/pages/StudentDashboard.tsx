
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, BookOpenIcon, AwardIcon, UserIcon } from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { getStudentCourses, getStudentMarks, getCourseAttendedHours, getCourseTotalHours } = useData();

  // Find student in mock data
  const studentUserId = user?.id;
  
  if (!studentUserId) {
    return <div>Loading student data...</div>;
  }

  const courses = getStudentCourses(studentUserId);
  const marks = getStudentMarks(studentUserId);

  // Calculate attendance statistics
  const attendanceStats = courses.map(course => {
    const totalHours = getCourseTotalHours(course.code);
    const attendedHours = getCourseAttendedHours(studentUserId, course.code);
    const percentage = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;
    const absentHours = totalHours - attendedHours;
    const requiredAttendance = 0.75 * totalHours; // 75% required
    const canMissMore = Math.max(0, attendedHours - requiredAttendance);
    const detained = percentage < 75;

    return {
      courseCode: course.code,
      courseName: course.name,
      totalHours,
      attendedHours,
      percentage,
      absentHours,
      canMissMore,
      detained
    };
  });

  // Calculate marks statistics
  const marksStats = courses.map(course => {
    const mark = marks.find(m => m.courseCode === course.code);
    return {
      courseCode: course.code,
      courseName: course.name,
      marks: mark ? mark.marks : 0,
      outOf: 60,
      percentage: mark ? (mark.marks / 60) * 100 : 0
    };
  });

  // Calculate overall statistics
  const overallAttendance = attendanceStats.reduce((acc, stat) => acc + stat.percentage, 0) / attendanceStats.length;
  const overallMarks = marksStats.reduce((acc, stat) => acc + stat.percentage, 0) / marksStats.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Register Number
            </CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RA2211003010280</div>
            <p className="text-xs text-muted-foreground">
              SRM University
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Attendance
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {overallAttendance >= 75 ? "Good standing" : "Attention needed"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Internal Marks
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMarks.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average across all courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Enrolled
            </CardTitle>
            <AwardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your personal and academic details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Age</p>
                  <p>20</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p>Computer Science</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p>3</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Semester</p>
                  <p>5</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>123 College Road, Chennai</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>
              Your current semester courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.code} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">{course.code}</p>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-right">
                      <p className="font-medium">Attendance</p>
                      <p className={`${attendanceStats.find(s => s.courseCode === course.code)?.percentage as number >= 75 ? "text-green-500" : "text-red-500"}`}>
                        {attendanceStats.find(s => s.courseCode === course.code)?.percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">Marks</p>
                      <p>{marksStats.find(s => s.courseCode === course.code)?.marks}/60</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
