import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: { email: string; password: string; name: string; company: string; role: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const savedUser = localStorage.getItem('tecnobra_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('tecnobra_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (!foundUser) {
      throw new Error('Email ou senha incorretos');
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('tecnobra_user', JSON.stringify(userWithoutPassword));
  };

  const signUp = async (userData: { email: string; password: string; name: string; company: string; role: string }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('tecnobra_users') || '[]');
    
    // Check if user already exists
    if (users.find((u: any) => u.email === userData.email)) {
      throw new Error('Este email já está cadastrado');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      company: userData.company,
      role: userData.role,
      password: userData.password
    };
    
    // Save to users list
    users.push(newUser);
    localStorage.setItem('tecnobra_users', JSON.stringify(users));
    
    // Log user in
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('tecnobra_user', JSON.stringify(userWithoutPassword));
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('tecnobra_user');
  };

  const value = {
    user,
    loading,
    signOut,
    signIn,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}