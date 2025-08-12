import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Shield, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const roleColors = {
  owner: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  editor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  contributor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  reader: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
};

const roleLabels = {
  owner: "Owner",
  editor: "Editor", 
  contributor: "Contributor",
  reader: "Reader"
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: user?.role === 'owner'
  });

  // Filter users based on search term
  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      const response = await apiRequest('PUT', '/api/users/role', { userId, role });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "Role Updated",
        description: `${updatedUser.name}'s role has been updated to ${roleLabels[updatedUser.role as keyof typeof roleLabels]}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Only owners can access this page
  if (user?.role !== 'owner') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 group">
          <Users className="h-8 w-8 text-jelly-pink float-animation" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-jelly-pink to-jelly-purple bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
            User Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Manage user roles and permissions for your Jelly Magazine
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-6 jelly-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-jelly-blue" />
            Search Users
          </CardTitle>
          <CardDescription>
            Search for users by name or email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md jelly-input"
          />
        </CardContent>
      </Card>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-jelly-pink"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? "No users found matching your search" : "No users found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((u: User) => (
              <Card key={u.id} className="jelly-card group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Profile Picture */}
                      {u.profilePictureUrl ? (
                        <img
                          src={u.profilePictureUrl.startsWith('/objects/') 
                            ? u.profilePictureUrl 
                            : u.profilePictureUrl}
                          alt={u.name}
                          className="w-12 h-12 rounded-full object-cover hover:scale-110 transition-all duration-300 pulse-glow"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-jelly-pink to-jelly-purple flex items-center justify-center hover:scale-110 transition-all duration-300 pulse-glow">
                          <span className="text-white font-semibold text-lg">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {u.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {u.email}
                        </p>
                        {u.bio && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 max-w-md">
                            {u.bio}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Role Management */}
                    <div className="flex items-center gap-3">
                      <Badge className={roleColors[u.role as keyof typeof roleColors]}>
                        <Shield className="h-3 w-3 mr-1" />
                        {roleLabels[u.role as keyof typeof roleLabels]}
                      </Badge>

                      {/* Role Change Dropdown - Don't show for current user */}
                      {u.id !== user?.id && (
                        <Select
                          value={u.role}
                          onValueChange={(newRole) => {
                            updateRoleMutation.mutate({ userId: u.id, role: newRole });
                          }}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-32 hover:scale-105 transition-all duration-200 bg-gradient-to-r from-jelly-mint/20 to-jelly-blue/20">
                            <Edit className="h-3 w-3 mr-1 text-jelly-purple" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reader">Reader</SelectItem>
                            <SelectItem value="contributor">Contributor</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Stats Summary */}
      <Card className="mt-8 jelly-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-jelly-yellow to-jelly-coral"></div>
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleLabels).map(([role, label]) => {
              const count = users.filter((u: User) => u.role === role).length;
              return (
                <div key={role} className="text-center group hover:scale-105 transition-all duration-300">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-jelly-pink transition-colors">
                    {count}
                  </div>
                  <div className={`text-sm px-3 py-2 rounded-full inline-block transition-all duration-300 group-hover:shadow-lg ${roleColors[role as keyof typeof roleColors]}`}>
                    {label}{count !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}