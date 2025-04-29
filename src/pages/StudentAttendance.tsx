
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, AlertTriangleIcon, CheckCircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const StudentAttendance = () => {
  const { user } = useAuth();
  const { getStudentCourses, getStudentAttendance, getCourseAttendedHours, getCourseTotalHours } = useData();

  const studentId = user?.id;
  
  if (!studentId) {
    return <div>Loading student data...</div>;
  }

  const courses = getStudentCourses(studentId);

  // Calculate attendance for each course
  const attendanceData = courses.map(course => {
    const totalHours = getCourseTotalHours(course.code);
    const attendedHours = getCourseAttendedHours(studentId, course.code);
    const percentage = totalHours > 0 ? (attendedHours / totalHours) * 100 : 0;
    const absentHours = totalHours - attendedHours;
    
    // Calculate how many more classes can be missed before detention
    const requiredAttendance = Math.ceil(0.75 * totalHours); // 75% required
    const classesCanMiss = Math.max(0, attendedHours - requiredAttendance);
    
    // Get detailed attendance records
    const attendanceRecords = getStudentAttendance(studentId, course.code);
    
    return {
      course,
      totalHours,
      attendedHours,
      absentHours,
      percentage,
      classesCanMiss,
      isDetained: percentage < 75,
      attendanceRecords
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Attendance Report</h2>
        <p className="text-muted-foreground">
          View your attendance status for all enrolled courses
        </p>
      </div>

      {attendanceData.some(data => data.isDetained) && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertTitle>Attention Required</AlertTitle>
          <AlertDescription>
            Your attendance is below 75% in one or more courses. Please attend classes regularly to avoid detention.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {attendanceData.map((data) => (
          <Card key={data.course.code} className={data.isDetained ? "border-red-500/20" : ""}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{data.course.code} - {data.course.name}</CardTitle>
                  <CardDescription>
                    Max Hours: {data.totalHours}
                  </CardDescription>
                </div>
                {data.isDetained ? (
                  <Badge variant="destructive">Detention Risk</Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Good Standing
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Attendance: {data.percentage.toFixed(1)}%</span>
                  <span className="text-muted-foreground">
                    {data.attendedHours}/{data.totalHours} hours
                  </span>
                </div>
                <Progress 
                  value={data.percentage} 
                  className={data.isDetained ? "bg-red-500/20" : "bg-green-500/20"}
                  indicatorClassName={data.isDetained ? "bg-red-500" : "bg-green-500"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Attended Hours</p>
                  <p className="font-medium text-green-500">{data.attendedHours}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Absent Hours</p>
                  <p className="font-medium text-red-500">{data.absentHours}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Required %</p>
                  <p className="font-medium">75%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Can Miss</p>
                  <p className="font-medium">{data.classesCanMiss} classes</p>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Recent Attendance
                </h4>
                <div className="space-y-2">
                  {data.attendanceRecords.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span>{record.date}</span>
                      {record.present ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircleIcon className="h-3 w-3 mr-1" /> Present
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          <AlertTriangleIcon className="h-3 w-3 mr-1" /> Absent
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
