import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableContent } from "@/components/EditableContent";
import ArticleCard from "@/components/ArticleCard";
import type { ArticleWithAuthor } from "@shared/schema";
import { Search, Filter } from "lucide-react";

export default function Archive() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (category !== 'all') queryParams.append('category', category);
  queryParams.append('sort', sortBy);
  queryParams.append('page', page.toString());

  const { data: articles, isLoading } = useQuery<ArticleWithAuthor[]>({
    queryKey: ['/api/articles', search, category, sortBy, page],
    queryFn: async () => {
      const response = await fetch(`/api/articles?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "design", label: "Design" },
    { value: "color-theory", label: "Color Theory" },
    { value: "mobile", label: "Mobile" },
    { value: "animation", label: "Animation" },
    { value: "typography", label: "Typography" },
    { value: "productivity", label: "Productivity" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "title", label: "Title A-Z" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-jelly-cream via-white to-jelly-purple/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <EditableContent
            section="archive"
            contentKey="title"
            defaultValue="Article Archive"
            as="h1"
            className="text-6xl font-bold bg-gradient-to-r from-jelly-pink via-jelly-purple to-jelly-blue bg-clip-text text-transparent mb-6"
          />
          <EditableContent
            section="archive"
            contentKey="subtitle"
            defaultValue="Explore our complete collection of colorful stories and creative inspiration"
            as="p"
            className="text-2xl text-gray-600 max-w-2xl mx-auto"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-2 border-jelly-pink/30 rounded-2xl focus:border-jelly-pink"
              />
            </div>

            {/* Category Filter */}
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-2 border-jelly-purple/30 rounded-2xl focus:border-jelly-purple">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-2 border-jelly-blue/30 rounded-2xl focus:border-jelly-blue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setSortBy("newest");
                setPage(1);
              }}
              variant="outline"
              className="border-2 border-jelly-coral/30 text-jelly-coral hover:bg-jelly-coral hover:text-white rounded-2xl"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, i) => (
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
        ) : articles && articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-16 space-x-4">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                className="px-8 py-3 border-2 border-jelly-pink/30 text-jelly-pink hover:bg-jelly-pink hover:text-white rounded-full"
              >
                Previous
              </Button>
              <span className="flex items-center px-6 py-3 bg-jelly-pink/10 text-jelly-pink font-semibold rounded-full">
                Page {page}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                variant="outline"
                className="px-8 py-3 border-2 border-jelly-pink/30 text-jelly-pink hover:bg-jelly-pink hover:text-white rounded-full"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-jelly-pink/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <Search className="h-16 w-16 text-jelly-pink" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Articles Found</h3>
            <p className="text-xl text-gray-600 mb-8">
              Try adjusting your search criteria or check back later for new content!
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setSortBy("newest");
              }}
              className="px-8 py-4 bg-gradient-to-r from-jelly-pink to-jelly-purple text-white font-bold rounded-full shadow-lg"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
