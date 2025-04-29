
import { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, UserCog, BookOpen, Calendar, BarChart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-md text-left",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-muted-foreground"
      )}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const STUDENT_ROUTES = [
  { label: "Dashboard", href: "/dashboard", icon: <User size={20} /> },
  { label: "Attendance", href: "/attendance", icon: <Calendar size={20} /> },
  { label: "Internal Marks", href: "/marks", icon: <BarChart size={20} /> },
];

const FACULTY_ROUTES = [
  { label: "Dashboard", href: "/dashboard", icon: <User size={20} /> },
  { label: "Manage Attendance", href: "/manage-attendance", icon: <Calendar size={20} /> },
  { label: "Manage Marks", href: "/manage-marks", icon: <BarChart size={20} /> },
];

const HOD_ROUTES = [
  { label: "Dashboard", href: "/dashboard", icon: <User size={20} /> },
  { label: "Manage Attendance", href: "/manage-attendance", icon: <Calendar size={20} /> },
  { label: "Manage Marks", href: "/manage-marks", icon: <BarChart size={20} /> },
  { label: "Department Analysis", href: "/analysis", icon: <BarChart size={20} /> },
  { label: "Manage Students", href: "/manage-students", icon: <Users size={20} /> },
];

const getUserRoutes = (role: string) => {
  switch (role) {
    case "student":
      return STUDENT_ROUTES;
    case "faculty":
      return FACULTY_ROUTES;
    case "hod":
      return HOD_ROUTES;
    default:
      return [];
  }
};

const DashboardLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handlePathChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePathChange);
    return () => window.removeEventListener("popstate", handlePathChange);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const routes = user ? getUserRoutes(user.role) : [];

  const handleNavigate = (href: string) => {
    navigate(href);
    setCurrentPath(href);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderSidebar = () => (
    <div className="space-y-4 py-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">
          {user?.role === "student" ? "Student Portal" :
           user?.role === "faculty" ? "Faculty Portal" : "HOD Portal"}
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <SidebarItem
              key={route.href}
              icon={route.icon}
              label={route.label}
              href={route.href}
              active={currentPath === route.href}
              onClick={() => handleNavigate(route.href)}
            />
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Account</h2>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="flex items-center gap-3 w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <aside className="hidden md:block w-64 border-r border-border bg-card">
        {renderSidebar()}
      </aside>

      {/* Mobile sidebar drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          {renderSidebar()}
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold">SRM Institute Student Portal</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm mr-2">
              Hello, {user?.name}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
