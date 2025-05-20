import { useQuery } from "@tanstack/react-query";
import { Brand } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedBrands = () => {
  const { data: brands, isLoading, error } = useQuery({
    queryKey: ['/api/brands'],
  });

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array(6).fill(0).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            Failed to load brands. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-secondary mb-8 text-center">Top Brands We Carry</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands?.map((brand: Brand) => (
            <Link key={brand.id} href={`/brands/${brand.slug}`}>
              <div className="bg-white rounded-lg p-6 shadow-md flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 hover:shadow-lg h-24">
                {brand.logoUrl ? (
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.name} 
                    className="max-h-12"
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-700">{brand.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
