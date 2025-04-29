
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserIcon, BookOpenIcon, UsersIcon, CalendarIcon } from "lucide-react";

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { getFacultyCourses, getStudentsByCourse } = useData();

  const facultyId = user?.id;
  
  if (!facultyId) {
    return <div>Loading faculty data...</div>;
  }

  const courses = getFacultyCourses(facultyId);
  
  // Get unique students across all courses
  const uniqueStudents = new Set();
  courses.forEach(course => {
    const students = getStudentsByCourse(course.code);
    students.forEach(student => uniqueStudents.add(student.id));
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faculty Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's your teaching overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Department
            </CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Computer Science</div>
            <p className="text-xs text-muted-foreground">
              SRM University
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses
            </CardTitle>
            <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Current semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Students
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueStudents.size}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Classes
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your faculty details
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
                  <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                  <p>{facultyId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p>Computer Science</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <p>Assistant Professor</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Teaching Courses</CardTitle>
            <CardDescription>
              Courses you are currently teaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.map((course) => {
                const students = getStudentsByCourse(course.code);
                return (
                  <div key={course.code} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{course.code}</p>
                      <p className="text-sm text-muted-foreground">{course.name}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">Students</p>
                      <p>{students.length}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;
