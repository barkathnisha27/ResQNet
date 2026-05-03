import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "citizen" | "ngo" | "government";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  reliability?: number;
  verifiedReports?: number;
  falseReports?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  signup: (name: string, email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS: Record<UserRole, User> = {
  citizen: {
    id: "c1",
    name: "Alex Rivera",
    email: "alex@citizen.com",
    role: "citizen",
    reliability: 87,
    verifiedReports: 12,
    falseReports: 1,
  },
  ngo: {
    id: "n1",
    name: "Sarah Chen",
    email: "sarah@redcross.org",
    role: "ngo",
  },
  government: {
    id: "g1",
    name: "Director James Marshall",
    email: "marshall@ndma.gov",
    role: "government",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((_email: string, _password: string, role: UserRole) => {
    setUser(MOCK_USERS[role]);
  }, []);

  const signup = useCallback((name: string, email: string, _password: string, role: UserRole) => {
    setUser({ ...MOCK_USERS[role], name, email });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
