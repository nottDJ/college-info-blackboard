
import { createContext, useContext, useState, ReactNode } from "react";

// Define user roles
export type UserRole = "student" | "faculty" | "hod";

// Define user structure
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Create auth context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database - in a real app, this would be fetched from a backend
const MOCK_USERS = [
  {
    id: "S001",
    name: "John Student",
    email: "student@example.com",
    password: "password",
    role: "student",
    regNumber: "RA2211003010280",
    age: 20,
    address: "123 College Road, Chennai",
    department: "Computer Science",
    year: 3,
    semester: 5
  },
  {
    id: "F001",
    name: "Jane Faculty",
    email: "faculty@example.com",
    password: "password",
    role: "faculty",
    department: "Computer Science",
    courses: ["CS101", "CS205", "CS301"]
  },
  {
    id: "H001", 
    name: "Sam HOD",
    email: "hod@example.com",
    password: "password",
    role: "hod",
    department: "Computer Science"
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password && u.role === role
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
