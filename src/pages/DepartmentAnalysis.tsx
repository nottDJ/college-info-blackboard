
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DepartmentAnalysis = () => {
  const { 
    courses, 
    getStudentsByCourse, 
    getStudentMarks, 
    getCourseAttendedHours, 
    getCourseTotalHours, 
    getDepartmentStudents 
  } = useData();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  
  // Department data (hardcoded for now)
  const department = "Computer Science";
  const departmentStudents = getDepartmentStudents(department);
  
  // Attendance analysis
  const attendanceAnalysis = courses.map(course => {
    const students = getStudentsByCourse(course.code);
    const totalHours = getCourseTotalHours(course.code);
    
    // Calculate average attendance for this course
    const attendancePercentages = students.map(student => {
      const attended = getCourseAttendedHours(student.id, course.code);
      return (attended / totalHours) * 100;
    });
    
    const averageAttendance = attendancePercentages.length > 0
      ? attendancePercentages.reduce((sum, percentage) => sum + percentage, 0) / attendancePercentages.length
      : 0;
      
    // Calculate detention risk
    const studentsAtRisk = attendancePercentages.filter(percentage => percentage < 75).length;
    
    return {
      courseCode: course.code,
      courseName: course.name,
      averageAttendance,
      totalStudents: students.length,
      studentsAtRisk,
      detentionRate: students.length > 0 ? (studentsAtRisk / students.length) * 100 : 0
    };
  });
  
  // Performance analysis
  const performanceAnalysis = courses.map(course => {
    const students = getStudentsByCourse(course.code);
    
    // Calculate average marks for this course
    const marks = students.map(student => {
      const markRecord = getStudentMarks(student.id).find(m => m.courseCode === course.code);
      return markRecord ? markRecord.marks : 0;
    });
    
    const averageMarks = marks.length > 0
      ? marks.reduce((sum, mark) => sum + mark, 0) / marks.length
      : 0;
      
    // Calculate grade distribution
    const gradeDistribution = {
      S: marks.filter(mark => (mark / 60) * 100 >= 90).length,
      A: marks.filter(mark => (mark / 60) * 100 >= 80 && (mark / 60) * 100 < 90).length,
      B: marks.filter(mark => (mark / 60) * 100 >= 70 && (mark / 60) * 100 < 80).length,
      C: marks.filter(mark => (mark / 60) * 100 >= 60 && (mark / 60) * 100 < 70).length,
      D: marks.filter(mark => (mark / 60) * 100 >= 50 && (mark / 60) * 100 < 60).length,
      F: marks.filter(mark => (mark / 60) * 100 < 50).length
    };
    
    // Calculate pass rate
    const passCount = marks.filter(mark => (mark / 60) * 100 >= 50).length;
    const passRate = students.length > 0 ? (passCount / students.length) * 100 : 0;
    
    return {
      courseCode: course.code,
      courseName: course.name,
      averageMarks,
      averagePercentage: (averageMarks / 60) * 100,
      totalStudents: students.length,
      gradeDistribution,
      passRate
    };
  });
  
  // Course-specific data
  const selectedCourseData = selectedCourse
    ? {
        attendance: attendanceAnalysis.find(data => data.courseCode === selectedCourse),
        performance: performanceAnalysis.find(data => data.courseCode === selectedCourse),
        students: getStudentsByCourse(selectedCourse).map(student => {
          const attended = getCourseAttendedHours(student.id, selectedCourse);
          const totalHours = getCourseTotalHours(selectedCourse);
          const attendancePercentage = (attended / totalHours) * 100;
          
          const markRecord = getStudentMarks(student.id).find(m => m.courseCode === selectedCourse);
          const marks = markRecord ? markRecord.marks : 0;
          const marksPercentage = (marks / 60) * 100;
          
          return {
            id: student.id,
            name: student.name,
            regNumber: student.regNumber,
            attendancePercentage,
            marks,
            marksPercentage
          };
        })
      }
    : null;
    
  // Grade distribution for pie chart
  const getGradeDistributionForChart = (courseCode: string) => {
    const performance = performanceAnalysis.find(data => data.courseCode === courseCode);
    if (!performance) return [];
    
    return [
      { name: "S (90-100%)", value: performance.gradeDistribution.S },
      { name: "A (80-89%)", value: performance.gradeDistribution.A },
      { name: "B (70-79%)", value: performance.gradeDistribution.B },
      { name: "C (60-69%)", value: performance.gradeDistribution.C },
      { name: "D (50-59%)", value: performance.gradeDistribution.D },
      { name: "F (Below 50%)", value: performance.gradeDistribution.F }
    ].filter(item => item.value > 0);
  };
  
  // Colors for pie chart
  const GRADE_COLORS = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#6b7280"];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Department Analysis</h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of department performance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Overview: {department}</CardTitle>
          <CardDescription>Summary statistics for the department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{departmentStudents.length}</div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{courses.length}</div>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {attendanceAnalysis.reduce((sum, data) => sum + data.studentsAtRisk, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Students at Detention Risk</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="attendance">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="attendance">Attendance Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Attendance Overview</CardTitle>
              <CardDescription>
                Average attendance and detention risk across courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={attendanceAnalysis}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseCode" angle={-45} textAnchor="end" height={70} />
                    <YAxis yAxisId="left" domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="averageAttendance" name="Average Attendance %" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="detentionRate" name="Detention Risk %" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Attendance Details by Course</CardTitle>
              <CardDescription>
                Detailed attendance statistics for each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                  <div className="col-span-1 font-medium">No.</div>
                  <div className="col-span-2 font-medium">Course Code</div>
                  <div className="col-span-3 font-medium">Course Name</div>
                  <div className="col-span-2 text-center font-medium">Avg. Attendance</div>
                  <div className="col-span-2 text-center font-medium">Total Students</div>
                  <div className="col-span-2 text-center font-medium">Students at Risk</div>
                </div>
                <div className="divide-y">
                  {attendanceAnalysis.map((data, index) => (
                    <div key={data.courseCode} className="grid grid-cols-12 items-center px-4 py-3">
                      <div className="col-span-1 text-sm">{index + 1}</div>
                      <div className="col-span-2 text-sm">{data.courseCode}</div>
                      <div className="col-span-3 text-sm">{data.courseName}</div>
                      <div className="col-span-2 text-center text-sm">
                        {data.averageAttendance.toFixed(1)}%
                      </div>
                      <div className="col-span-2 text-center text-sm">{data.totalStudents}</div>
                      <div className="col-span-2 text-center text-sm">
                        {data.studentsAtRisk} ({data.detentionRate.toFixed(1)}%)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Performance Overview</CardTitle>
              <CardDescription>
                Average marks and pass rates across courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceAnalysis}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 70,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="courseCode" angle={-45} textAnchor="end" height={70} />
                    <YAxis yAxisId="left" domain={[0, 60]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="averageMarks" name="Average Marks (/60)" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Performance Details by Course</CardTitle>
              <CardDescription>
                Detailed performance statistics for each course
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                  <div className="col-span-1 font-medium">No.</div>
                  <div className="col-span-2 font-medium">Course Code</div>
                  <div className="col-span-3 font-medium">Course Name</div>
                  <div className="col-span-2 text-center font-medium">Avg. Marks</div>
                  <div className="col-span-2 text-center font-medium">Pass Rate</div>
                  <div className="col-span-2 text-center font-medium">Total Students</div>
                </div>
                <div className="divide-y">
                  {performanceAnalysis.map((data, index) => (
                    <div key={data.courseCode} className="grid grid-cols-12 items-center px-4 py-3">
                      <div className="col-span-1 text-sm">{index + 1}</div>
                      <div className="col-span-2 text-sm">{data.courseCode}</div>
                      <div className="col-span-3 text-sm">{data.courseName}</div>
                      <div className="col-span-2 text-center text-sm">
                        {data.averageMarks.toFixed(1)}/60 ({data.averagePercentage.toFixed(1)}%)
                      </div>
                      <div className="col-span-2 text-center text-sm">{data.passRate.toFixed(1)}%</div>
                      <div className="col-span-2 text-center text-sm">{data.totalStudents}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Course-Specific Analysis</CardTitle>
          <CardDescription>
            Detailed analysis for a specific course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="course">Select Course</Label>
            <Select 
              value={selectedCourse} 
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger id="course">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(course => (
                  <SelectItem key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCourseData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Attendance Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {selectedCourseData.attendance?.averageAttendance.toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Average Attendance</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {selectedCourseData.attendance?.studentsAtRisk}
                          </div>
                          <p className="text-sm text-muted-foreground">Students at Risk</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Performance Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {selectedCourseData.performance?.averageMarks.toFixed(1)}/60
                          </div>
                          <p className="text-sm text-muted-foreground">Average Marks</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {selectedCourseData.performance?.passRate.toFixed(1)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Pass Rate</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getGradeDistributionForChart(selectedCourse)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {getGradeDistributionForChart(selectedCourse).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Attendance vs Performance</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedCourseData.students.map(student => ({
                          name: student.name.split(' ')[0],
                          attendance: student.attendancePercentage,
                          marks: student.marksPercentage
                        }))}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 30,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="attendance" name="Attendance %" fill="#8884d8" />
                        <Bar dataKey="marks" name="Marks %" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Student-Wise Analysis</h3>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                    <div className="col-span-1 font-medium">No.</div>
                    <div className="col-span-3 font-medium">Reg Number</div>
                    <div className="col-span-4 font-medium">Student Name</div>
                    <div className="col-span-2 text-center font-medium">Attendance</div>
                    <div className="col-span-2 text-center font-medium">Marks</div>
                  </div>
                  <div className="divide-y">
                    {selectedCourseData.students.map((student, index) => (
                      <div key={student.id} className="grid grid-cols-12 items-center px-4 py-3">
                        <div className="col-span-1 text-sm">{index + 1}</div>
                        <div className="col-span-3 text-sm">{student.regNumber}</div>
                        <div className="col-span-4 text-sm">{student.name}</div>
                        <div className="col-span-2 text-center text-sm">
                          <span className={student.attendancePercentage < 75 ? "text-red-500" : "text-green-500"}>
                            {student.attendancePercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="col-span-2 text-center text-sm">
                          {student.marks}/60 ({student.marksPercentage.toFixed(1)}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentAnalysis;
