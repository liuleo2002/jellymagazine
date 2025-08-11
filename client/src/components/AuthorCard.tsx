import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthorBioEditor } from "@/components/AuthorBioEditor";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface AuthorCardProps {
  author: User;
  articleCount?: number;
}

export default function AuthorCard({ author, articleCount = 0 }: AuthorCardProps) {
  const { user } = useAuth();
  // Users can edit their own profile, or owners can edit any profile
  const canEdit = user?.id === author.id || user?.role === 'owner';
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
    <div className="text-center group relative">
      <div className="profile-hover mb-6 inline-block">
        <Avatar className="w-32 h-32 border-4 border-jelly-pink shadow-lg">
          <AvatarImage src={author.profilePictureUrl || ""} alt={author.name} />
          <AvatarFallback className="text-3xl font-bold">
            {author.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{author.name}</h3>
      
      <div className="mb-3">
        <Badge className={`${getRoleBadgeClass(author.role)} px-4 py-1 text-sm font-semibold rounded-full capitalize`}>
          {author.role}
        </Badge>
      </div>
      
      {author.bio && (
        <p className="text-gray-600 mb-4 leading-relaxed">
          {author.bio}
        </p>
      )}
      
      {articleCount > 0 && (
        <p className="text-sm text-jelly-purple font-semibold mb-4">
          {articleCount} article{articleCount !== 1 ? 's' : ''} published
        </p>
      )}
      
      <div className="flex justify-center space-x-3">
        <a href="#" className="text-jelly-pink hover:text-jelly-purple transition-colors">
          <i className="fab fa-twitter text-xl"></i>
        </a>
        <a href="#" className="text-jelly-pink hover:text-jelly-purple transition-colors">
          <i className="fab fa-linkedin text-xl"></i>
        </a>
        <a href="#" className="text-jelly-pink hover:text-jelly-purple transition-colors">
          <i className="fab fa-dribbble text-xl"></i>
        </a>
      </div>
      
      {/* Author Bio Editor */}
      <AuthorBioEditor author={author} canEdit={canEdit} />
    </div>
  );
}
