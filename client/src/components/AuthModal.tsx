import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, signupSchema, type Login, type Signup } from "@shared/schema";

interface AuthModalProps {
  mode: 'login' | 'signup' | null;
  onClose: () => void;
}

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const { login, signup, isLoading } = useAuth();

  const loginForm = useForm<Login>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<Signup>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      masterCode: "",
    },
  });

  useEffect(() => {
    if (mode) {
      loginForm.reset();
      signupForm.reset();
    }
  }, [mode, loginForm, signupForm]);

  const handleLogin = async (data: Login) => {
    try {
      await login(data);
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleSignup = async (data: Signup) => {
    try {
      await signup(data);
      onClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!mode) return null;

  return (
    <Dialog open={!!mode} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        {mode === 'login' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-gray-800 text-center">Welcome Back!</DialogTitle>
              <DialogDescription className="text-gray-600 text-center">
                Sign in to your Jelly account
              </DialogDescription>
            </DialogHeader>
            
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="border-2 border-jelly-pink/30 rounded-2xl focus:border-jelly-pink"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          className="border-2 border-jelly-purple/30 rounded-2xl focus:border-jelly-purple"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="jelly-button w-full py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  {isLoading ? "Signing In..." : "Sign In"} <i className="fas fa-sign-in-alt ml-2"></i>
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">Don't have an account? 
                <button 
                  onClick={() => window.location.hash = 'signup'}
                  className="text-jelly-pink font-semibold hover:text-jelly-purple transition-colors ml-1"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-3xl font-bold text-gray-800 text-center">Join Jelly!</DialogTitle>
              <DialogDescription className="text-gray-600 text-center">
                Create your colorful account
              </DialogDescription>
            </DialogHeader>
            
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-6">
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          className="border-2 border-jelly-pink/30 rounded-2xl focus:border-jelly-pink"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          className="border-2 border-jelly-purple/30 rounded-2xl focus:border-jelly-purple"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Create a strong password"
                          className="border-2 border-jelly-blue/30 rounded-2xl focus:border-jelly-blue"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="masterCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">Master Code (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter if you have owner access"
                          className="border-2 border-jelly-yellow/30 rounded-2xl focus:border-jelly-yellow"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">Leave blank for regular account</p>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="jelly-button w-full py-4 bg-gradient-to-r from-jelly-purple to-jelly-blue text-white font-bold text-lg rounded-2xl shadow-lg"
                >
                  {isLoading ? "Creating Account..." : "Create Account"} <i className="fas fa-user-plus ml-2"></i>
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">Already have an account? 
                <button 
                  onClick={() => window.location.hash = 'login'}
                  className="text-jelly-purple font-semibold hover:text-jelly-pink transition-colors ml-1"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
