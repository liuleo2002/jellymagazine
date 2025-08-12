import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Archive from "@/pages/Archive";
import Article from "@/pages/Article";
import Authors from "@/pages/Authors";
import Contact from "@/pages/Contact";
import Editor from "@/pages/Editor";
import Dashboard from "@/pages/Dashboard";
import UserManagement from "@/pages/UserManagement";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-jelly-mint/5 to-jelly-blue/5">
      <Navbar />
      <main className="flex-1 pt-20 transition-all duration-300">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/archive" component={Archive} />
          <Route path="/article/:id" component={Article} />
          <Route path="/authors" component={Authors} />
          <Route path="/contact" component={Contact} />
          <Route path="/editor/:id?" component={Editor} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/users" component={UserManagement} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
