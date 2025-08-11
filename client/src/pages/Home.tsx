import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleWithAuthor } from "@shared/schema";

export default function Home() {
  const { data: featuredArticle, isLoading: featuredLoading } = useQuery<ArticleWithAuthor>({
    queryKey: ['/api/articles/featured'],
  });

  const { data: recentArticles, isLoading: recentLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ['/api/articles/recent'],
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-jelly-pink/10 via-jelly-purple/10 to-jelly-blue/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-jelly-yellow/30 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-jelly-coral/30 rounded-full animate-bounce-slow"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-jelly-mint/30 rounded-full animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent mb-6 animate-pulse">
            Welcome to Jelly!
          </h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your go-to online magazine for creative inspiration, colorful stories, and bubbly content that makes you smile! 🎨✨
          </p>
          
          {/* Featured Article Card */}
          {featuredLoading ? (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
              <Skeleton className="w-full h-96" />
              <div className="p-8 space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
          ) : featuredArticle ? (
            <div className="jelly-card max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
              {featuredArticle.imageUrl && (
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title}
                  className="w-full h-96 object-cover"
                />
              )}
              
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-2 bg-jelly-pink text-white text-sm font-semibold rounded-full">Featured</span>
                  <span className="text-gray-500 text-sm">
                    {new Date(featuredArticle.publishDate || featuredArticle.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-4xl font-bold text-gray-800 mb-4">
                  {featuredArticle.title}
                </h3>
                
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={featuredArticle.author.profilePictureUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`} 
                      alt={featuredArticle.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{featuredArticle.author.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{featuredArticle.author.role}</p>
                    </div>
                  </div>
                  
                  <Link href={`/article/${featuredArticle.id}`}>
                    <Button className="jelly-button px-8 py-4 bg-gradient-to-r from-jelly-purple to-jelly-blue text-white font-semibold rounded-full shadow-lg">
                      Read More <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Featured Article Yet</h3>
              <p className="text-gray-600">Check back soon for featured content!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Articles Grid */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-800 mb-4">Latest Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Fresh content delivered weekly, bursting with creativity and inspiration!</p>
            
            {/* Decorative Elements */}
            <div className="flex justify-center space-x-4 mt-8">
              <div className="w-3 h-3 bg-jelly-pink rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-jelly-purple rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-jelly-blue rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>

          {recentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentArticles && recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Articles Yet</h3>
              <p className="text-gray-600 mb-6">Be the first to publish some colorful content!</p>
            </div>
          )}

          <div className="text-center mt-16">
            <Link href="/archive">
              <Button className="jelly-button px-12 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold text-lg rounded-full shadow-xl">
                Load More Stories <i className="fas fa-magic ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
