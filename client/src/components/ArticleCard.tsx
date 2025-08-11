import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ArticleWithAuthor } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: ArticleWithAuthor;
  showExcerpt?: boolean;
  className?: string;
}

export default function ArticleCard({ article, showExcerpt = true, className = "" }: ArticleCardProps) {
  const categoryColors = {
    'Design': 'jelly-yellow/20 text-jelly-coral',
    'Color Theory': 'jelly-blue/20 text-jelly-purple',
    'Mobile': 'jelly-mint/20 text-jelly-blue',
    'Animation': 'jelly-pink/20 text-jelly-purple',
    'Typography': 'jelly-coral/20 text-jelly-pink',
    'Productivity': 'jelly-yellow/20 text-jelly-blue',
  };

  const getBadgeClass = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || 'jelly-pink/20 text-jelly-purple';
  };

  return (
    <div className={`jelly-card bg-white rounded-3xl shadow-xl overflow-hidden ${className}`}>
      {article.imageUrl && (
        <img 
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          {article.category && (
            <Badge className={`px-3 py-1 bg-${getBadgeClass(article.category)} text-xs font-semibold rounded-full`}>
              {article.category}
            </Badge>
          )}
          <span className="text-gray-500 text-sm">
            {formatDistanceToNow(new Date(article.publishDate || article.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        <Link href={`/article/${article.id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-jelly-pink transition-colors cursor-pointer">
            {article.title}
          </h3>
        </Link>
        
        {showExcerpt && (
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {article.excerpt}
          </p>
        )}
        
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={article.author.profilePictureUrl || ""} alt={article.author.name} />
            <AvatarFallback>{article.author.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-gray-700">{article.author.name}</span>
        </div>
      </div>
    </div>
  );
}
