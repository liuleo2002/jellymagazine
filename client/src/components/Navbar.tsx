import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { EditableContent } from "@/components/EditableContent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User, Edit, Settings, LogOut, Users } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/archive", label: "Archive" },
    { href: "/authors", label: "Authors" },
    { href: "/contact", label: "Contact" },
  ];

  const getNavLinkClass = (href: string) => {
    const isActive = location === href || (href !== "/" && location.startsWith(href));
    return `text-lg font-medium transition-colors duration-300 ${
      isActive
        ? "text-jelly-pink"
        : "text-gray-700 hover:text-jelly-pink"
    }`;
  };

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b-2 border-jelly-pink/50' 
          : 'bg-white/90 backdrop-blur-lg shadow-lg border-b-4 border-jelly-pink'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-16' : 'h-20'
          }`}>
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className={`bg-gradient-to-br from-jelly-pink to-jelly-purple rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-12 hover:scale-110 transition-all duration-300 ease-out ${
                isScrolled ? 'w-10 h-10' : 'w-12 h-12'
              }`}>
                <span className={`text-white font-bold transition-all duration-300 ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`}>J</span>
              </div>
              <EditableContent
                section="header"
                contentKey="logo"
                type="text"
                defaultValue="Jelly"
                className={`font-bold bg-gradient-to-r from-jelly-pink to-jelly-purple bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? 'text-xl' : 'text-2xl'
                }`}
                placeholder="Site Name"
                multiline={false}
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a className={`relative px-3 py-2 rounded-full transition-all duration-300 hover:bg-jelly-pink/10 hover:scale-110 ${getNavLinkClass(link.href)}`}>
                    {link.label}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-jelly-pink to-jelly-purple transform scale-x-0 transition-transform duration-300 hover:scale-x-100"></span>
                  </a>
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profilePictureUrl || ""} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                        <p className="text-xs text-jelly-purple font-semibold capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    {(user.role === 'editor' || user.role === 'owner') && (
                      <DropdownMenuItem asChild>
                        <Link href="/editor">
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Create Article</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === 'owner' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/users">
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Users</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    onClick={() => setAuthModal('login')}
                    className="px-6 py-3 bg-gradient-to-r from-jelly-pink to-jelly-coral text-white font-semibold rounded-full hover:scale-105 hover:shadow-xl active:scale-95 transform transition-all duration-200 ease-out"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => setAuthModal('signup')}
                    className="px-6 py-3 bg-gradient-to-r from-jelly-purple to-jelly-blue text-white font-semibold rounded-full hover:scale-105 hover:shadow-xl active:scale-95 transform transition-all duration-200 ease-out"
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden p-2 rounded-xl bg-jelly-pink/20 hover:bg-jelly-pink/30 hover:scale-110 active:scale-95 transform transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className={`text-jelly-pink transition-all duration-300 ${mobileMenuOpen ? 'rotate-90' : 'rotate-0'} ${
                  isScrolled ? 'text-lg' : 'text-xl'
                }`} />
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-jelly-pink/20">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <a 
                      className={`block px-4 py-2 rounded-lg ${getNavLinkClass(link.href)}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        mode={authModal}
        onClose={() => setAuthModal(null)}
      />
    </>
  );
}
