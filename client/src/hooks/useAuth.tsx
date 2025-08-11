import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, Login, Signup } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (credentials: Login) => Promise<void>;
  signup: (data: Signup) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(null);
    }
  }, [currentUser]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Signup) => {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      return response.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Welcome to Jelly!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    apiRequest('POST', '/api/auth/logout').then(() => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Goodbye!",
        description: "You've been signed out successfully.",
      });
    });
  };

  const value = {
    user,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout,
    isLoading: isLoading || loginMutation.isPending || signupMutation.isPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
