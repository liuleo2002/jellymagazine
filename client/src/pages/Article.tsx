import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { ArticleWithAuthor } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Edit, Trash2, Calendar, User } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export default function Article() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: article, isLoading } = useQuery<ArticleWithAuthor>({
    queryKey: ['/api/articles', id],
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: "Article Deleted",
        description: "The article has been successfully deleted.",
      });
      window.location.href = "/archive";
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Skeleton className="w-full h-96 rounded-3xl mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">The article you're looking for doesn't exist.</p>
          <Link href="/archive">
            <Button className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full">
              Browse Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canEditArticle = user && (
    user.id === article.authorId || 
    user.role === 'owner' || 
    user.role === 'editor'
  );

  const canDeleteArticle = user && (
    user.id === article.authorId || 
    user.role === 'owner'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-blue/10">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Image */}
        {article.imageUrl && (
          <div className="relative mb-12 overflow-hidden rounded-3xl shadow-2xl">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        )}

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {article.category && (
                <Badge className="px-4 py-2 bg-jelly-pink text-white font-semibold rounded-full">
                  {article.category}
                </Badge>
              )}
              {article.status === 'draft' && (
                <Badge variant="secondary" className="px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full">
                  Draft
                </Badge>
              )}
            </div>
            
            {canEditArticle && (
              <div className="flex space-x-2">
                <Link href={`/editor/${article.id}`}>
                  <Button size="sm" className="bg-jelly-blue hover:bg-jelly-purple text-white rounded-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                {canDeleteArticle && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="rounded-full"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this article?")) {
                        deleteArticleMutation.mutate();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent mb-8 leading-tight">
            {article.title}
          </h1>

          {/* Author and Meta Info */}
          <div className="flex items-center justify-between flex-wrap gap-4 p-6 bg-white rounded-3xl shadow-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 border-4 border-jelly-pink">
                <AvatarImage src={article.author.profilePictureUrl || ""} alt={article.author.name} />
                <AvatarFallback className="text-xl font-bold">
                  {article.author.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{article.author.name}</h3>
                <p className="text-jelly-purple font-semibold capitalize">{article.author.role}</p>
                {article.author.bio && (
                  <p className="text-gray-600 text-sm mt-1">{article.author.bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>
                  {formatDistanceToNow(new Date(article.publishDate || article.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-xl max-w-none">
          <div 
            className="text-lg leading-relaxed text-gray-700"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Article Footer */}
        <footer className="mt-16 pt-12 border-t-2 border-jelly-pink/20">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Enjoyed this article?</h3>
            <p className="text-gray-600 mb-6">Explore more colorful content and creative inspiration</p>
            <div className="flex justify-center space-x-4">
              <Link href="/archive">
                <Button className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full shadow-lg">
                  More Articles
                </Button>
              </Link>
              <Link href="/authors">
                <Button variant="outline" className="px-8 py-4 border-2 border-jelly-blue text-jelly-blue hover:bg-jelly-blue hover:text-white rounded-full">
                  Meet Our Authors
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
