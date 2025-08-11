import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateRoleSchema, type UpdateRole, type User, type Article } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Users, FileText, Crown, Edit, Settings, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Check if user is owner
  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-jelly-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Crown className="h-16 w-16 text-jelly-pink" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-8">Only owners can access the dashboard.</p>
          <Button onClick={() => setLocation('/')} className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalUsers: number;
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/all'],
  });

  const form = useForm<UpdateRole>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      userId: "",
      role: "reader",
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: UpdateRole) => {
      await apiRequest('PUT', '/api/users/role', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setRoleModalOpen(false);
      setSelectedUser(null);
      form.reset();
      toast({
        title: "Role Updated!",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    form.setValue('userId', user.id);
    form.setValue('role', user.role as any);
    setRoleModalOpen(true);
  };

  const getRoleBadgeClass = (role: string) => {
    const roleColors = {
      'owner': 'bg-jelly-pink text-white',
      'editor': 'bg-jelly-purple text-white',
      'contributor': 'bg-jelly-coral text-white',
      'reader': 'bg-jelly-blue text-white',
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-jelly-blue text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-purple/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-jelly-pink to-jelly-purple rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-xl text-gray-600">Manage your Jelly magazine</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i} className="jelly-card">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))
          ) : (
            <>
              <Card className="jelly-card bg-gradient-to-br from-jelly-pink/10 to-jelly-pink/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-jelly-pink" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-jelly-pink">{stats?.totalUsers || 0}</div>
                </CardContent>
              </Card>

              <Card className="jelly-card bg-gradient-to-br from-jelly-purple/10 to-jelly-purple/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                  <FileText className="h-4 w-4 text-jelly-purple" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-jelly-purple">{stats?.totalArticles || 0}</div>
                </CardContent>
              </Card>

              <Card className="jelly-card bg-gradient-to-br from-jelly-blue/10 to-jelly-blue/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Published</CardTitle>
                  <TrendingUp className="h-4 w-4 text-jelly-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-jelly-blue">{stats?.publishedArticles || 0}</div>
                </CardContent>
              </Card>

              <Card className="jelly-card bg-gradient-to-br from-jelly-coral/10 to-jelly-coral/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                  <Edit className="h-4 w-4 text-jelly-coral" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-jelly-coral">{stats?.draftArticles || 0}</div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* User Management */}
          <Card className="jelly-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <Users className="h-6 w-6 mr-2 text-jelly-pink" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {users.map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={userItem.profilePictureUrl || ""} alt={userItem.name} />
                          <AvatarFallback>{userItem.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-800">{userItem.name}</p>
                          <p className="text-sm text-gray-500">{userItem.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getRoleBadgeClass(userItem.role)} px-3 py-1 text-xs font-semibold rounded-full capitalize`}>
                          {userItem.role}
                        </Badge>
                        {userItem.id !== user.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRoleModal(userItem)}
                            className="text-jelly-purple hover:bg-jelly-purple hover:text-white rounded-full"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Articles */}
          <Card className="jelly-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                <FileText className="h-6 w-6 mr-2 text-jelly-purple" />
                Recent Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articlesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : articles && articles.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {articles.slice(0, 10).map((article) => (
                    <div key={article.id} className="p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800 truncate flex-1 mr-4">{article.title}</h4>
                        <Badge 
                          className={article.status === 'published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {article.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{article.excerpt}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No articles found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Role Update Modal */}
      <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              Change the role for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateRoleMutation.mutate(data))} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reader">Reader</SelectItem>
                        <SelectItem value="contributor">Contributor</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRoleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateRoleMutation.isPending}
                  className="bg-gradient-to-r from-jelly-pink to-jelly-purple text-white"
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
