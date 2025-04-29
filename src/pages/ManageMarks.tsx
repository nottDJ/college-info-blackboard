
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ManageMarks = () => {
  const { user } = useAuth();
  const { 
    getFacultyCourses, 
    getStudentsByCourse, 
    addMark, 
    getStudentMarks,
    courses
  } = useData();
  const { toast } = useToast();

  const facultyId = user?.id;
  const isHod = user?.role === "hod";
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [marksData, setMarksData] = useState<{ studentId: string; marks: number }[]>([]);
  const [viewCourse, setViewCourse] = useState("");

  // Get courses based on role
  const availableCourses = isHod ? courses : (facultyId ? getFacultyCourses(facultyId) : []);

  // Handle course selection for marks entry
  const handleCourseChange = (courseCode: string) => {
    setSelectedCourse(courseCode);
    
    // Initialize marks data for all students in this course
    const students = getStudentsByCourse(courseCode);
    const existingMarks = students.map(student => {
      const markRecord = getStudentMarks(student.id).find(m => m.courseCode === courseCode);
      return {
        studentId: student.id,
        marks: markRecord ? markRecord.marks : 0
      };
    });
    
    setMarksData(existingMarks);
  };

  // Update mark for a student
  const updateMark = (studentId: string, marks: number) => {
    // Validate marks
    if (marks < 0) marks = 0;
    if (marks > 60) marks = 60;
    
    setMarksData(prev => 
      prev.map(item => 
        item.studentId === studentId ? { ...item, marks } : item
      )
    );
  };

  // Save marks
  const saveMarks = () => {
    if (!selectedCourse) {
      toast({
        title: "Error",
        description: "Please select a course",
        variant: "destructive"
      });
      return;
    }

    marksData.forEach(data => {
      addMark({
        studentId: data.studentId,
        courseCode: selectedCourse,
        marks: data.marks
      });
    });

    toast({
      title: "Success",
      description: "Marks saved successfully"
    });
  };

  // Get data for marks analysis
  const viewStudents = viewCourse ? getStudentsByCourse(viewCourse) : [];
  
  const analysisData = viewCourse 
    ? viewStudents.map(student => {
        const markRecord = getStudentMarks(student.id).find(m => m.courseCode === viewCourse);
        const marks = markRecord ? markRecord.marks : 0;
        const percentage = (marks / 60) * 100;
        
        let grade = "";
        if (percentage >= 90) grade = "S";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";
        else grade = "F";
        
        return {
          id: student.id,
          name: student.name,
          regNumber: student.regNumber,
          marks,
          percentage,
          grade
        };
      })
    : [];
    
  // Prepare chart data
  const chartData = analysisData.map(data => ({
    name: data.name.split(' ')[0], // Just use first name for chart
    marks: data.marks,
    percentage: data.percentage
  }));

  // Calculate stats
  const averageMarks = analysisData.length > 0 
    ? analysisData.reduce((sum, data) => sum + data.marks, 0) / analysisData.length 
    : 0;
    
  const gradeDistribution = [
    { grade: "S (90-100%)", count: analysisData.filter(d => d.percentage >= 90).length },
    { grade: "A (80-89%)", count: analysisData.filter(d => d.percentage >= 80 && d.percentage < 90).length },
    { grade: "B (70-79%)", count: analysisData.filter(d => d.percentage >= 70 && d.percentage < 80).length },
    { grade: "C (60-69%)", count: analysisData.filter(d => d.percentage >= 60 && d.percentage < 70).length },
    { grade: "D (50-59%)", count: analysisData.filter(d => d.percentage >= 50 && d.percentage < 60).length },
    { grade: "F (Below 50%)", count: analysisData.filter(d => d.percentage < 50).length }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Internal Marks</h2>
        <p className="text-muted-foreground">
          Record and analyze internal assessment marks
        </p>
      </div>

      <Tabs defaultValue="record">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="record">Record Marks</TabsTrigger>
          <TabsTrigger value="analyze">Analyze Marks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="record" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Record Internal Marks</CardTitle>
              <CardDescription>
                Enter marks for students (out of 60)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
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

                {selectedCourse && (
                  <div className="mt-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                        <div className="col-span-1 font-medium">No.</div>
                        <div className="col-span-3 font-medium">Reg Number</div>
                        <div className="col-span-5 font-medium">Student Name</div>
                        <div className="col-span-3 text-center font-medium">Marks (/60)</div>
                      </div>
                      <div className="divide-y">
                        {getStudentsByCourse(selectedCourse).map((student, index) => {
                          const markRecord = marksData.find(m => m.studentId === student.id);
                          const marks = markRecord ? markRecord.marks : 0;
                          
                          return (
                            <div key={student.id} className="grid grid-cols-12 items-center px-4 py-3">
                              <div className="col-span-1 text-sm">{index + 1}</div>
                              <div className="col-span-3 text-sm">{student.regNumber}</div>
                              <div className="col-span-5 text-sm">{student.name}</div>
                              <div className="col-span-3 flex justify-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max="60"
                                  value={marks}
                                  onChange={(e) => updateMark(student.id, parseInt(e.target.value) || 0)}
                                  className="w-20 text-center"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveMarks} disabled={!selectedCourse || marksData.length === 0}>
                Save Marks
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyze" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Marks Analysis</CardTitle>
              <CardDescription>
                Analyze student performance in internal assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
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
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Performance Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{analysisData.length}</div>
                            <p className="text-sm text-muted-foreground">Total Students</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{averageMarks.toFixed(1)}/60</div>
                            <p className="text-sm text-muted-foreground">Average Marks</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {((averageMarks / 60) * 100).toFixed(1)}%
                            </div>
                            <p className="text-sm text-muted-foreground">Average Percentage</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Marks Distribution</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={chartData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 60]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="marks" name="Marks (/60)" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Grade Distribution</h3>
                    <div className="h-60">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={gradeDistribution}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="grade" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Number of Students" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Detailed Marks</h3>
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
                        <div className="col-span-1 font-medium">No.</div>
                        <div className="col-span-3 font-medium">Reg Number</div>
                        <div className="col-span-4 font-medium">Student Name</div>
                        <div className="col-span-2 text-center font-medium">Marks</div>
                        <div className="col-span-2 text-center font-medium">Grade</div>
                      </div>
                      <div className="divide-y">
                        {analysisData.map((data, index) => (
                          <div key={data.id} className="grid grid-cols-12 items-center px-4 py-3">
                            <div className="col-span-1 text-sm">{index + 1}</div>
                            <div className="col-span-3 text-sm">{data.regNumber}</div>
                            <div className="col-span-4 text-sm">{data.name}</div>
                            <div className="col-span-2 text-center text-sm">{data.marks}/60 ({data.percentage.toFixed(1)}%)</div>
                            <div className="col-span-2 text-center text-sm font-medium">{data.grade}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageMarks;
