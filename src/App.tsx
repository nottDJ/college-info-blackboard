
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import DashboardLayout from "@/components/DashboardLayout";
import Login from "@/pages/Login";
import StudentDashboard from "@/pages/StudentDashboard";
import StudentAttendance from "@/pages/StudentAttendance";
import StudentMarks from "@/pages/StudentMarks";
import FacultyDashboard from "@/pages/FacultyDashboard";
import ManageAttendance from "@/pages/ManageAttendance";
import ManageMarks from "@/pages/ManageMarks";
import DepartmentAnalysis from "@/pages/DepartmentAnalysis";
import ManageStudents from "@/pages/ManageStudents";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<DashboardLayout />}>
                {/* Student Routes */}
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/attendance" element={<StudentAttendance />} />
                <Route path="/marks" element={<StudentMarks />} />
                
                {/* Faculty and HOD Routes */}
                <Route path="/manage-attendance" element={<ManageAttendance />} />
                <Route path="/manage-marks" element={<ManageMarks />} />
                
                {/* HOD-only Routes */}
                <Route path="/analysis" element={<DepartmentAnalysis />} />
                <Route path="/manage-students" element={<ManageStudents />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
