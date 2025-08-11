import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import AuthorCard from "@/components/AuthorCard";
import type { User } from "@shared/schema";

export default function Authors() {
  const { data: authors, isLoading } = useQuery<(User & { articleCount: number })[]>({
    queryKey: ['/api/authors'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-jelly-purple/10 to-jelly-blue/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent mb-6">
            Meet Our Creative Team
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
            The colorful minds behind Jelly's inspiring content!
          </p>
        </div>

        {/* Authors Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-32 h-32 rounded-full mx-auto mb-6" />
                <Skeleton className="h-8 w-32 mx-auto mb-2" />
                <Skeleton className="h-6 w-24 mx-auto mb-3" />
                <Skeleton className="h-16 w-48 mx-auto mb-4" />
                <div className="flex justify-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                  <Skeleton className="w-8 h-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : authors && authors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {authors.map((author) => (
              <AuthorCard 
                key={author.id} 
                author={author} 
                articleCount={author.articleCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-jelly-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-users text-4xl text-jelly-pink"></i>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Authors Yet</h3>
            <p className="text-xl text-gray-600">
              Our creative team is growing! Check back soon to meet our contributors.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-20 p-12 bg-white rounded-3xl shadow-2xl">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Want to Join Our Team?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for passionate writers and creative minds to share their colorful stories with the world.
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="/contact"
              className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get In Touch
            </a>
            <a
              href="#"
              className="px-8 py-4 border-2 border-jelly-blue text-jelly-blue hover:bg-jelly-blue hover:text-white rounded-full transition-colors duration-300"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
