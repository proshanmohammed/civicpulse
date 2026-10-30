import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'citizen' | 'authority' | null;

interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (role: NonNullable<UserRole>, name: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem('metroshield_user') || sessionStorage.getItem('civicpulse_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((role: NonNullable<UserRole>, name: string, email: string) => {
    const avatar = getInitials(name) || (role === 'citizen' ? 'CZ' : 'AU');
    const newUser: AuthUser = { role, name, email, avatar };
    sessionStorage.setItem('metroshield_user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('metroshield_user');
    sessionStorage.removeItem('civicpulse_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
