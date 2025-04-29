
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon, TrashIcon, SearchIcon } from "lucide-react";

const ManageStudents = () => {
  const { students, addStudent, removeStudent } = useData();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    regNumber: "",
    department: "Computer Science",
    year: 1,
    semester: 1
  });
  
  // Filter students based on search query
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.regNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle adding a new student
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.regNumber) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check if registration number already exists
    if (students.some(s => s.regNumber === newStudent.regNumber)) {
      toast({
        title: "Error",
        description: "Registration number already exists",
        variant: "destructive"
      });
      return;
    }
    
    const studentId = `S${(students.length + 1).toString().padStart(3, '0')}`;
    
    addStudent({
      id: studentId,
      ...newStudent
    });
    
    toast({
      title: "Success",
      description: "Student added successfully"
    });
    
    // Reset form and close dialog
    setNewStudent({
      name: "",
      regNumber: "",
      department: "Computer Science",
      year: 1,
      semester: 1
    });
    setShowAddDialog(false);
  };
  
  // Handle removing a student
  const handleRemoveStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to remove ${studentName}?`)) {
      removeStudent(studentId);
      
      toast({
        title: "Success",
        description: "Student removed successfully"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manage Students</h2>
          <p className="text-muted-foreground">
            Add, remove, or search for students in your department
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details for the new student
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student's full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regNumber">Registration Number</Label>
                <Input
                  id="regNumber"
                  value={newStudent.regNumber}
                  onChange={(e) => setNewStudent({ ...newStudent, regNumber: e.target.value })}
                  placeholder="e.g. RA2211003010283"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={newStudent.department}
                  onValueChange={(value) => setNewStudent({ ...newStudent, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={newStudent.year.toString()}
                    onValueChange={(value) => setNewStudent({ ...newStudent, year: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={newStudent.semester.toString()}
                    onValueChange={(value) => setNewStudent({ ...newStudent, semester: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddStudent}>
                Add Student
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Database</CardTitle>
          <CardDescription>
            Manage students in your department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or registration number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-12 border-b px-4 py-3 bg-muted/50">
              <div className="col-span-1 font-medium">No.</div>
              <div className="col-span-3 font-medium">Reg Number</div>
              <div className="col-span-3 font-medium">Student Name</div>
              <div className="col-span-2 font-medium">Year/Sem</div>
              <div className="col-span-2 font-medium">Department</div>
              <div className="col-span-1 text-center font-medium">Actions</div>
            </div>
            <div className="divide-y">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <div key={student.id} className="grid grid-cols-12 items-center px-4 py-3">
                    <div className="col-span-1 text-sm">{index + 1}</div>
                    <div className="col-span-3 text-sm">{student.regNumber}</div>
                    <div className="col-span-3 text-sm">{student.name}</div>
                    <div className="col-span-2 text-sm">Year {student.year}, Sem {student.semester}</div>
                    <div className="col-span-2 text-sm">{student.department}</div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveStudent(student.id, student.name)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">Remove student</span>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-muted-foreground">
                  {searchQuery
                    ? "No students found matching your search"
                    : "No students in the database yet"}
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Total: {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ManageStudents;
