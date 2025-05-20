import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import ProductCard from "@/components/product/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

const FeaturedProducts = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/products', { featured: true }],
    queryFn: async () => {
      const response = await fetch('/api/products?featured=true&limit=4');
      const data = await response.json();
      return data;
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-6 w-24 hidden md:block" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 h-[460px]">
                <div className="relative">
                  <Skeleton className="w-full h-56 rounded-md" />
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
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
            Failed to load featured products. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!data || !data.products || data.products.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-heading text-secondary mb-8">Best Selling Products</h2>
          <div className="text-center text-gray-500 py-12">
            No featured products available at the moment. Check back soon!
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold font-heading text-secondary">Best Selling Products</h2>
          <Link href="/products?featured=true" className="text-primary font-semibold hover:underline hidden md:flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="link" className="text-primary font-semibold">
            <Link href="/products?featured=true">
              View All Products <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
