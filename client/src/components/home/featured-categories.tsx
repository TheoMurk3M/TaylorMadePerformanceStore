import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['/api/categories'],
    select: (data: Category[]) => {
      // Sort categories by product count (desc)
      return [...data].sort((a, b) => (b.productCount || 0) - (a.productCount || 0)).slice(0, 6);
    }
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-1/3 mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Skeleton className="rounded-lg w-full h-40" />
                <Skeleton className="h-6 w-2/3 mx-auto" />
                <Skeleton className="h-4 w-1/3 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Failed to load categories. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-secondary mb-8">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories?.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                <img 
                  src={category.imageUrl || `https://placehold.co/400x300?text=${encodeURIComponent(category.name)}`} 
                  alt={category.name} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 text-center">
                  <h3 className="font-heading font-semibold text-lg">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.productCount || 0}+ Products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
