
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon, XIcon } from "lucide-react";

const ManageAttendance = () => {
  const { user } = useAuth();
  const { 
    getFacultyCourses, 
    getStudentsByCourse, 
    addAttendance, 
    getStudentAttendance,
    courses
  } = useData();

  const facultyId = user?.id;
  const isHod = user?.role === "hod";
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState<{ studentId: string; present: boolean }[]>([]);
  const [viewCourse, setViewCourse] = useState("");
  const [viewStudentId, setViewStudentId] = useState("");

  // Get courses based on role
  const availableCourses = isHod ? courses : (facultyId ? getFacultyCourses(facultyId) : []);

  // Handle course selection
  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    
    // Initialize attendance data for all students in this course
    const students = getStudentsByCourse(courseCode);
    setAttendanceData(
      students.map(student => ({
        studentId: student.id,
        present: true
      }))
    );
  };

  // Toggle attendance status
  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.studentId === studentId ? { ...item, present: !item.present } : item
      )
    );
  };

  // Save attendance
  const saveAttendance = () => {
    if (!selectedCourse || !selectedDate) {
      toast.error("Please select a course and date");
      return;
    }

    attendanceData.forEach(data => {
      addAttendance({
        studentId: data.studentId,
        courseCode: selectedCourse,
        date: selectedDate,
        present: data.present
      });
    });

    toast.success("Attendance saved successfully");
  };

  // Get students for viewing
  const viewStudents = viewCourse ? getStudentsByCourse(viewCourse) : [];
  
  // Get attendance records for viewing
  const viewAttendanceRecords = viewCourse && viewStudentId 
    ? getStudentAttendance(viewStudentId, viewCourse)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Attendance</h2>
        <p className="text-muted-foreground">
          Record and view attendance for your courses
        </p>
      </div>

      <Tabs defaultValue="record">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="record">Record Attendance</TabsTrigger>
          <TabsTrigger value="view">View Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Record New Attendance</CardTitle>
              <CardDescription>
                Take attendance for a class session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="course">Select Course</Label>
                  <Select 
                    value={selectedCourse} 
                    onValueChange={handleCourseChange}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map(course => (
                        <SelectItem key={course.code} value={course.code}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    <Input
                      type="date"
                      id="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {selectedCourse && (
                <div className="space-y-4 mt-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                      <div className="col-span-1 font-medium">No.</div>
                      <div className="col-span-3 font-medium">Reg Number</div>
                      <div className="col-span-6 font-medium">Student Name</div>
                      <div className="col-span-2 text-center font-medium">Present</div>
                    </div>
                    <div className="divide-y">
                      {getStudentsByCourse(selectedCourse).map((student, index) => {
                        const attendanceRecord = attendanceData.find(a => a.studentId === student.id);
                        const isPresent = attendanceRecord ? attendanceRecord.present : true;
                        
                        return (
                          <div key={student.id} className="grid grid-cols-12 items-center px-4 py-3">
                            <div className="col-span-1 text-sm">{index + 1}</div>
                            <div className="col-span-3 text-sm">{student.regNumber}</div>
                            <div className="col-span-6 text-sm">{student.name}</div>
                            <div className="col-span-2 flex justify-center">
                              <Checkbox
                                checked={isPresent}
                                onCheckedChange={() => toggleAttendance(student.id)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={saveAttendance} disabled={!selectedCourse || attendanceData.length === 0}>
                Save Attendance
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="view" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>View Attendance Records</CardTitle>
              <CardDescription>
                Check attendance history for students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="view-course">Select Course</Label>
                  <Select 
                    value={viewCourse} 
                    onValueChange={setViewCourse}
                  >
                    <SelectTrigger id="view-course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map(course => (
                        <SelectItem key={course.code} value={course.code}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {viewCourse && (
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="view-student">Select Student</Label>
                    <Select 
                      value={viewStudentId} 
                      onValueChange={setViewStudentId}
                    >
                      <SelectTrigger id="view-student">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {viewStudents.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.regNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {viewCourse && viewStudentId && (
                <div className="mt-4">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-4 border-b px-4 py-3 bg-muted/50">
                      <div className="col-span-1 font-medium">No.</div>
                      <div className="col-span-2 font-medium">Date</div>
                      <div className="col-span-1 text-center font-medium">Status</div>
                    </div>
                    <div className="divide-y">
                      {viewAttendanceRecords.length > 0 ? (
                        viewAttendanceRecords.map((record, index) => (
                          <div key={index} className="grid grid-cols-4 items-center px-4 py-3">
                            <div className="col-span-1 text-sm">{index + 1}</div>
                            <div className="col-span-2 text-sm">{record.date}</div>
                            <div className="col-span-1 flex justify-center">
                              {record.present ? (
                                <div className="flex items-center text-green-500">
                                  <CheckIcon className="h-4 w-4 mr-1" />
                                  <span>Present</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-500">
                                  <XIcon className="h-4 w-4 mr-1" />
                                  <span>Absent</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-muted-foreground">
                          No attendance records found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageAttendance;
