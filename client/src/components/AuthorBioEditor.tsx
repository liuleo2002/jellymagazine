import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Edit2, Save, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

const bioUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  profilePictureUrl: z.string().url().optional().or(z.literal("")),
});

type BioUpdate = z.infer<typeof bioUpdateSchema>;

interface AuthorBioEditorProps {
  author: User;
  canEdit: boolean;
}

export function AuthorBioEditor({ author, canEdit }: AuthorBioEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(author.profilePictureUrl || "");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<BioUpdate>({
    resolver: zodResolver(bioUpdateSchema),
    defaultValues: {
      name: author.name,
      bio: author.bio || "",
      profilePictureUrl: author.profilePictureUrl || "",
    },
  });

  const updateBioMutation = useMutation({
    mutationFn: async (data: BioUpdate) => {
      const response = await apiRequest('PUT', `/api/users/${author.id}/profile`, {
        ...data,
        profilePictureUrl: profileImageUrl || null,
      });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['/api/authors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      // Update local profile image state
      setProfileImageUrl(updatedUser.profilePictureUrl || "");
      
      // Reset form with updated data
      form.reset({
        name: updatedUser.name,
        bio: updatedUser.bio || '',
        profilePictureUrl: updatedUser.profilePictureUrl || '',
      });
      
      // Close dialog and show success
      setIsOpen(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
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

  const handleImageUpload = async () => {
    try {
      const response = await apiRequest('POST', '/api/objects/upload');
      const data = await response.json();
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to get upload URL. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const uploadURL = uploadedFile.uploadURL;
      
      try {
        // Set ACL policy for the uploaded image
        const response = await apiRequest('PUT', '/api/profile-images', {
          profileImageURL: uploadURL,
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileImageUrl(data.objectPath);
          form.setValue('profilePictureUrl', data.objectPath);
          toast({
            title: "Image Uploaded",
            description: "Profile image uploaded successfully!",
          });
        }
      } catch (error) {
        toast({
          title: "Upload Failed",
          description: "Failed to process uploaded image.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = (data: BioUpdate) => {
    // Include the current profile image URL in the submission
    const updatedData = {
      ...data,
      profilePictureUrl: profileImageUrl || data.profilePictureUrl,
    };
    updateBioMutation.mutate(updatedData);
  };

  if (!canEdit) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3 mr-1" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Your Profile</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Picture</label>
              <div className="flex items-center space-x-4">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl.startsWith('/objects/') 
                      ? profileImageUrl 
                      : profileImageUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB
                  onGetUploadParameters={handleImageUpload}
                  onComplete={handleUploadComplete}
                  buttonClassName="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </ObjectUploader>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About Me</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell readers about yourself..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                disabled={updateBioMutation.isPending}
                className="flex-1 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateBioMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}