import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Article } from "@shared/schema";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedArticles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const response = await fetch('/api/articles?limit=3');
      return await response.json();
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-32 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Skeleton className="h-6 w-40 mx-auto" />
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Failed to load articles. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!data || !data.articles || data.articles.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-secondary mb-8">From Our Blog</h2>
          <div className="text-center text-gray-500 py-12">
            No articles available at the moment. Check back soon!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-secondary">From Our Blog</h2>
          <Link href="/blog" className="text-primary font-semibold hover:underline hidden md:flex items-center">
            View All Articles <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.articles.map((article: Article) => (
            <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
              <div className="overflow-hidden">
                <img 
                  src={article.imageUrl || "https://images.unsplash.com/photo-1516149893016-813d9a01d5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"} 
                  alt={article.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(article.publishedAt || article.createdAt)}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    By {article.author}
                  </span>
                </div>
                <h3 className="font-heading font-semibold text-xl mb-3 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {article.excerpt || `${article.content.substring(0, 120)}...`}
                </p>
                <Link 
                  href={`/blog/${article.slug}`}
                  className="text-primary font-semibold hover:underline inline-flex items-center"
                >
                  Read More <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link 
            href="/blog"
            className="text-primary font-semibold hover:underline inline-flex items-center"
          >
            View All Articles <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArticles;
