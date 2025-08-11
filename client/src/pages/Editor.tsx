import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import RichTextEditor from "@/components/RichTextEditor";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { insertArticleSchema, type InsertArticle, type Article } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Save, Eye, Upload, ArrowLeft } from "lucide-react";
import type { UploadResult } from '@uppy/core';

const editorSchema = insertArticleSchema.extend({
  excerpt: insertArticleSchema.shape.excerpt,
});

export default function Editor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUploading, setImageUploading] = useState(false);

  const isEditing = !!id && id !== 'new';

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ['/api/articles', id],
    enabled: isEditing,
  });

  const form = useForm<InsertArticle>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      imageUrl: "",
      authorId: user?.id || "",
      category: "",
      status: user?.role === 'contributor' ? 'draft' : 'published',
    },
  });

  // Update form when article loads
  useEffect(() => {
    if (article && isEditing) {
      form.reset({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        imageUrl: article.imageUrl || "",
        authorId: article.authorId,
        category: article.category || "",
        status: article.status,
      });
    }
  }, [article, isEditing, form]);

  const saveArticleMutation = useMutation({
    mutationFn: async (data: InsertArticle) => {
      const url = isEditing ? `/api/articles/${id}` : '/api/articles';
      const method = isEditing ? 'PUT' : 'POST';
      const response = await apiRequest(method, url, data);
      return response.json();
    },
    onSuccess: (savedArticle) => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: isEditing ? "Article Updated!" : "Article Created!",
        description: `Your article has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      if (!isEditing) {
        setLocation(`/article/${savedArticle.id}`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = async () => {
    try {
      const response = await apiRequest('POST', '/api/objects/upload');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }
      const { uploadURL } = await response.json();
      return {
        method: 'PUT' as const,
        url: uploadURL,
      };
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to get upload URL",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const imageUrl = uploadedFile.uploadURL;
      
      // Use the upload URL directly - it's publicly accessible from Google Cloud Storage
      form.setValue('imageUrl', imageUrl);
      toast({
        title: "Image Uploaded!",
        description: "Your image has been uploaded successfully.",
      });
    }
    setImageUploading(false);
  };

  // Check permissions after all hooks are defined
  if (!user || !['owner', 'editor', 'contributor'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-600 mb-8">You don't have permission to create or edit articles.</p>
          <Button onClick={() => setLocation('/')} className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4 text-jelly-purple hover:text-jelly-pink"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent">
              {isEditing ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              {user.role === 'contributor' 
                ? 'Write your story and submit it for review' 
                : 'Share your colorful ideas with the world'}
            </p>
          </div>
        </div>

        {/* Editor Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => saveArticleMutation.mutate(data))} className="space-y-8">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold text-gray-700">Article Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter a catchy title for your article..."
                        className="text-xl border-2 border-jelly-pink/30 rounded-2xl focus:border-jelly-pink p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Excerpt */}
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold text-gray-700">Article Excerpt</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Write a brief description of your article..."
                        className="border-2 border-jelly-purple/30 rounded-2xl focus:border-jelly-purple p-4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold text-gray-700">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger className="border-2 border-jelly-blue/30 rounded-2xl focus:border-jelly-blue">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="color-theory">Color Theory</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                        <SelectItem value="typography">Typography</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div>
                <label className="block text-xl font-semibold text-gray-700 mb-4">Featured Image</label>
                <div className="flex items-center space-x-4">
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={handleImageUpload}
                    onComplete={handleUploadComplete}
                    buttonClassName="px-6 py-3 bg-jelly-coral text-white font-semibold rounded-full hover:bg-jelly-yellow shadow-lg"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Image
                  </ObjectUploader>
                  {form.watch('imageUrl') && (
                    <img 
                      src={form.watch('imageUrl') || ""} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded-lg border-2 border-jelly-pink/30"
                    />
                  )}
                </div>
              </div>

              {/* Content Editor */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xl font-semibold text-gray-700">Article Content</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start writing your colorful story..."
                        height={500}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status (if not contributor) */}
              {user.role !== 'contributor' && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xl font-semibold text-gray-700">Publication Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-jelly-yellow/30 rounded-2xl focus:border-jelly-yellow">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Save as Draft</SelectItem>
                          <SelectItem value="published">Publish Now</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/archive')}
                  className="px-8 py-3 border-2 border-jelly-blue text-jelly-blue hover:bg-jelly-blue hover:text-white rounded-full"
                >
                  Cancel
                </Button>

                <div className="flex space-x-4">
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation(`/article/${id}`)}
                      className="px-8 py-3 border-2 border-jelly-purple text-jelly-purple hover:bg-jelly-purple hover:text-white rounded-full"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Preview
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={saveArticleMutation.isPending || imageUploading}
                    className="px-8 py-3 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full shadow-lg"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saveArticleMutation.isPending 
                      ? (isEditing ? 'Updating...' : 'Saving...') 
                      : (isEditing ? 'Update Article' : 'Save Article')
                    }
                  </Button>
                </div>
              </div>

              {user.role === 'contributor' && (
                <div className="bg-jelly-yellow/10 border border-jelly-yellow/30 rounded-2xl p-4 text-center">
                  <p className="text-jelly-yellow font-semibold">
                    <i className="fas fa-info-circle mr-2"></i>
                    Your article will be submitted for review by an editor before publication.
                  </p>
                </div>
              )}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
