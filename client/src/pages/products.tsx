import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Product, Category, Brand } from "@shared/schema";
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Drawer, 
  DrawerContent,

  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
  DrawerTrigger
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/product/product-card";
import { Helmet } from "react-helmet";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "price_asc" | "price_desc" | "rating_desc" | "popularity";

interface Filters {
  category?: string;
  brand?: string;
  make?: string;
  model?: string;
  year?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  inStock?: boolean;
  onSale?: boolean;
}

const ITEMS_PER_PAGE = 12;

const ProductsPage = () => {
  const [location, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<Filters>({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{min?: string; max?: string}>({});

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const filters: Filters = {};
    
    // Extract filter values from URL
    if (params.has('category')) filters.category = params.get('category') || undefined;
    if (params.has('brand')) filters.brand = params.get('brand') || undefined;
    if (params.has('make')) filters.make = params.get('make') || undefined;
    if (params.has('model')) filters.model = params.get('model') || undefined;
    if (params.has('year')) filters.year = params.get('year') || undefined;
    if (params.has('min')) filters.minPrice = params.get('min') || undefined;
    if (params.has('max')) filters.maxPrice = params.get('max') || undefined;
    if (params.has('search')) filters.search = params.get('search') || undefined;
    if (params.has('inStock')) filters.inStock = params.get('inStock') === 'true';
    if (params.has('onSale')) filters.onSale = params.get('onSale') === 'true';
    
    // Set page if specified
    if (params.has('page')) {
      const pageParam = parseInt(params.get('page') || '1');
      setCurrentPage(isNaN(pageParam) ? 1 : pageParam);
    }
    
    // Set sort option if specified
    if (params.has('sort')) {
      const sortParam = params.get('sort');
      if (sortParam && ['newest', 'price_asc', 'price_desc', 'rating_desc', 'popularity'].includes(sortParam)) {
        setSortOption(sortParam as SortOption);
      }
    }
    
    // Set filters
    setActiveFilters(filters);
    
    // Set price range inputs
    setPriceRange({
      min: filters.minPrice,
      max: filters.maxPrice
    });
  }, [location]);

  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Fetch brands
  const { data: brands, isLoading: isBrandsLoading } = useQuery({
    queryKey: ['/api/brands'],
  });
  
  // Fetch makes for vehicle filter
  const { data: makes, isLoading: isMakesLoading } = useQuery({
    queryKey: ['/api/vehicle-makes'],
  });
  
  // Fetch models based on selected make
  const { data: models, isLoading: isModelsLoading } = useQuery({
    queryKey: ['/api/vehicle-models', activeFilters.make],
    enabled: !!activeFilters.make,
  });
  
  // Fetch years based on selected make and model
  const { data: years, isLoading: isYearsLoading } = useQuery({
    queryKey: ['/api/vehicle-years', activeFilters.make, activeFilters.model],
    enabled: !!activeFilters.make && !!activeFilters.model,
  });

  // Build the query string for products based on filters and pagination
  const buildProductQueryString = () => {
    const params = new URLSearchParams();
    
    // Filter parameters
    if (activeFilters.category) params.append('category', activeFilters.category);
    if (activeFilters.brand) params.append('brand', activeFilters.brand);
    if (activeFilters.search) params.append('search', activeFilters.search);
    if (activeFilters.minPrice) params.append('min_price', activeFilters.minPrice);
    if (activeFilters.maxPrice) params.append('max_price', activeFilters.maxPrice);
    if (activeFilters.inStock) params.append('in_stock', 'true');
    if (activeFilters.onSale) params.append('on_sale', 'true');
    
    // Vehicle fitment 
    if (activeFilters.make && activeFilters.model && activeFilters.year) {
      params.append('fitment', `${activeFilters.make}|${activeFilters.model}|${activeFilters.year}`);
    }
    
    // Sorting
    let sortBy: string;
    let sortOrder: 'asc' | 'desc';
    
    switch(sortOption) {
      case 'price_asc':
        sortBy = 'price';
        sortOrder = 'asc';
        break;
      case 'price_desc':
        sortBy = 'price';
        sortOrder = 'desc';
        break;
      case 'newest':
        sortBy = 'createdAt';
        sortOrder = 'desc';
        break;
      case 'rating_desc':
        sortBy = 'rating';
        sortOrder = 'desc';
        break;
      case 'popularity':
      default:
        sortBy = 'reviewCount';
        sortOrder = 'desc';
        break;
    }
    
    params.append('sort', sortBy);
    params.append('order', sortOrder);
    
    // Pagination
    params.append('limit', ITEMS_PER_PAGE.toString());
    params.append('offset', ((currentPage - 1) * ITEMS_PER_PAGE).toString());
    
    return params.toString();
  };

  // Fetch products based on filters, sort, and pagination
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery({
    queryKey: ['/api/products', buildProductQueryString()],
    keepPreviousData: true,
  });

  // Apply filters and update URL
  const applyFilters = (newFilters: Filters) => {
    const params = new URLSearchParams();
    
    // Add all filters to params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    // Add pagination and sorting
    params.append('page', '1'); // Reset to first page
    params.append('sort', sortOption);
    
    // Update URL and state
    setLocation(`/products?${params.toString()}`);
    setCurrentPage(1);
    setActiveFilters(newFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    setLocation(`/products?${params.toString()}`);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('sort', value);
    setLocation(`/products?${params.toString()}`);
    setSortOption(value as SortOption);
  };

  // Handle price range filter
  const handlePriceRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFilters = { ...activeFilters };
    if (priceRange.min) newFilters.minPrice = priceRange.min;
    else delete newFilters.minPrice;
    
    if (priceRange.max) newFilters.maxPrice = priceRange.max;
    else delete newFilters.maxPrice;
    
    applyFilters(newFilters);
    setIsMobileFilterOpen(false);
  };

  // Clear a specific filter
  const clearFilter = (filterKey: keyof Filters) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterKey];
    applyFilters(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocation('/products');
    setActiveFilters({});
    setPriceRange({});
  };

  // Get current page title based on filters
  const getPageTitle = () => {
    if (activeFilters.search) {
      return `Search Results for "${activeFilters.search}"`;
    }
    
    if (activeFilters.category) {
      const category = categories?.find((c: Category) => c.slug === activeFilters.category);
      return category ? category.name : 'Products';
    }
    
    if (activeFilters.brand) {
      const brand = brands?.find((b: Brand) => b.slug === activeFilters.brand);
      return brand ? brand.name : 'Products';
    }
    
    if (activeFilters.make && activeFilters.model && activeFilters.year) {
      return `${activeFilters.year} ${activeFilters.make} ${activeFilters.model} Parts`;
    }
    
    return 'All Products';
  };

  // Loading state
  const showLoading = isProductsLoading && !productsData;
  
  // Get products and pagination info
  const products = productsData?.products || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  
  return (
    <>
      <Helmet>
        <title>{getPageTitle()} - Taylor Made Performance UTV Parts</title>
        <meta name="description" content={`Shop our extensive collection of ${getPageTitle().toLowerCase()}. Premium quality, best prices, and fast shipping.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-secondary mb-2">
            {getPageTitle()}
          </h1>
          
          {/* Active Filters */}
          {Object.keys(activeFilters).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-500">Active Filters:</span>
              
              {activeFilters.search && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('search')}
                >
                  Search: {activeFilters.search}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.category && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('category')}
                >
                  Category: {categories?.find((c: Category) => c.slug === activeFilters.category)?.name}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.brand && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('brand')}
                >
                  Brand: {brands?.find((b: Brand) => b.slug === activeFilters.brand)?.name}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.make && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('make')}
                >
                  Make: {activeFilters.make}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.model && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('model')}
                >
                  Model: {activeFilters.model}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.year && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('year')}
                >
                  Year: {activeFilters.year}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {(activeFilters.minPrice || activeFilters.maxPrice) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => {
                    clearFilter('minPrice');
                    clearFilter('maxPrice');
                  }}
                >
                  Price: {activeFilters.minPrice ? `$${activeFilters.minPrice}` : '$0'} - {activeFilters.maxPrice ? `$${activeFilters.maxPrice}` : 'Any'}
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.inStock && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('inStock')}
                >
                  In Stock Only
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {activeFilters.onSale && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => clearFilter('onSale')}
                >
                  On Sale
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
              
              {Object.keys(activeFilters).length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              {/* Categories */}
              <Accordion type="single" collapsible defaultValue="categories" className="mb-4">
                <AccordionItem value="categories" className="border-b-0">
                  <AccordionTrigger className="text-base font-medium py-2">Categories</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-1">
                      {isCategoriesLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))
                      ) : (
                        categories?.map((category: Category) => (
                          <div 
                            key={category.id} 
                            className={`text-sm cursor-pointer hover:text-primary ${activeFilters.category === category.slug ? 'text-primary font-medium' : ''}`}
                            onClick={() => applyFilters({ ...activeFilters, category: category.slug })}
                          >
                            {category.name} <span className="text-gray-400">({category.productCount || 0})</span>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Brands */}
              <Accordion type="single" collapsible defaultValue="brands" className="mb-4">
                <AccordionItem value="brands" className="border-b-0">
                  <AccordionTrigger className="text-base font-medium py-2">Brands</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pl-1">
                      {isBrandsLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <Skeleton key={i} className="h-6 w-full" />
                        ))
                      ) : (
                        brands?.map((brand: Brand) => (
                          <div 
                            key={brand.id} 
                            className={`text-sm cursor-pointer hover:text-primary ${activeFilters.brand === brand.slug ? 'text-primary font-medium' : ''}`}
                            onClick={() => applyFilters({ ...activeFilters, brand: brand.slug })}
                          >
                            {brand.name}
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Vehicle Fitment */}
              <Accordion type="single" collapsible defaultValue="fitment" className="mb-4">
                <AccordionItem value="fitment" className="border-b-0">
                  <AccordionTrigger className="text-base font-medium py-2">Vehicle Fitment</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {/* Make */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Make</label>
                        <Select 
                          value={activeFilters.make} 
                          onValueChange={(value) => {
                            const newFilters = { ...activeFilters, make: value };
                            delete newFilters.model;
                            delete newFilters.year;
                            applyFilters(newFilters);
                          }}
                        >
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue placeholder="Select Make" />
                          </SelectTrigger>
                          <SelectContent>
                            {isMakesLoading ? (
                              <div className="p-2">
                                <Skeleton className="h-6 w-full" />
                              </div>
                            ) : (
                              makes?.map((make: string) => (
                                <SelectItem key={make} value={make}>{make}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Model */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Model</label>
                        <Select 
                          value={activeFilters.model} 
                          onValueChange={(value) => {
                            const newFilters = { ...activeFilters, model: value };
                            delete newFilters.year;
                            applyFilters(newFilters);
                          }}
                          disabled={!activeFilters.make}
                        >
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue placeholder="Select Model" />
                          </SelectTrigger>
                          <SelectContent>
                            {isModelsLoading ? (
                              <div className="p-2">
                                <Skeleton className="h-6 w-full" />
                              </div>
                            ) : (
                              models?.map((model: string) => (
                                <SelectItem key={model} value={model}>{model}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Year */}
                      <div>
                        <label className="text-sm font-medium mb-1 block">Year</label>
                        <Select 
                          value={activeFilters.year} 
                          onValueChange={(value) => {
                            applyFilters({ ...activeFilters, year: value });
                          }}
                          disabled={!activeFilters.make || !activeFilters.model}
                        >
                          <SelectTrigger className="text-sm h-9">
                            <SelectValue placeholder="Select Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {isYearsLoading ? (
                              <div className="p-2">
                                <Skeleton className="h-6 w-full" />
                              </div>
                            ) : (
                              years?.map((year: number) => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Price Range */}
              <Accordion type="single" collapsible defaultValue="price" className="mb-4">
                <AccordionItem value="price" className="border-b-0">
                  <AccordionTrigger className="text-base font-medium py-2">Price Range</AccordionTrigger>
                  <AccordionContent>
                    <form onSubmit={handlePriceRangeSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Min</label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="$"
                            className="h-9"
                            value={priceRange.min || ''}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Max</label>
                          <Input
                            type="number"
                            min="0"
                            placeholder="$"
                            className="h-9"
                            value={priceRange.max || ''}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full h-9 text-sm">Apply</Button>
                    </form>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              {/* Availability */}
              <div className="mb-6">
                <h3 className="text-base font-medium mb-3">Availability</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="inStock" 
                      checked={activeFilters.inStock}
                      onCheckedChange={(checked) => {
                        applyFilters({ ...activeFilters, inStock: checked as boolean || undefined });
                      }}
                    />
                    <label htmlFor="inStock" className="ml-2 text-sm">In Stock Only</label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox 
                      id="onSale" 
                      checked={activeFilters.onSale}
                      onCheckedChange={(checked) => {
                        applyFilters({ ...activeFilters, onSale: checked as boolean || undefined });
                      }}
                    />
                    <label htmlFor="onSale" className="ml-2 text-sm">On Sale</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="flex-1">
            {/* Mobile Filter Button & Sort Options */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {/* Mobile Filter Toggle */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Filters</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-4 overflow-y-auto max-h-[70vh]">
                    {/* Mobile Filters Content - simplified version of desktop filters */}
                    <Accordion type="single" collapsible defaultValue="categories" className="mb-4">
                      <AccordionItem value="categories" className="border-b-0">
                        <AccordionTrigger className="text-base font-medium py-2">Categories</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-1">
                            {categories?.map((category: Category) => (
                              <div 
                                key={category.id} 
                                className={`text-sm cursor-pointer hover:text-primary ${activeFilters.category === category.slug ? 'text-primary font-medium' : ''}`}
                                onClick={() => {
                                  applyFilters({ ...activeFilters, category: category.slug });
                                  setIsMobileFilterOpen(false);
                                }}
                              >
                                {category.name} <span className="text-gray-400">({category.productCount || 0})</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Brands */}
                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="brands" className="border-b-0">
                        <AccordionTrigger className="text-base font-medium py-2">Brands</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-1">
                            {brands?.map((brand: Brand) => (
                              <div 
                                key={brand.id} 
                                className={`text-sm cursor-pointer hover:text-primary ${activeFilters.brand === brand.slug ? 'text-primary font-medium' : ''}`}
                                onClick={() => {
                                  applyFilters({ ...activeFilters, brand: brand.slug });
                                  setIsMobileFilterOpen(false);
                                }}
                              >
                                {brand.name}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Vehicle Fitment */}
                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="fitment" className="border-b-0">
                        <AccordionTrigger className="text-base font-medium py-2">Vehicle Fitment</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3">
                            {/* Make */}
                            <div>
                              <label className="text-sm font-medium mb-1 block">Make</label>
                              <Select 
                                value={activeFilters.make} 
                                onValueChange={(value) => {
                                  const newFilters = { ...activeFilters, make: value };
                                  delete newFilters.model;
                                  delete newFilters.year;
                                  applyFilters(newFilters);
                                }}
                              >
                                <SelectTrigger className="text-sm h-9">
                                  <SelectValue placeholder="Select Make" />
                                </SelectTrigger>
                                <SelectContent>
                                  {makes?.map((make: string) => (
                                    <SelectItem key={make} value={make}>{make}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Model */}
                            <div>
                              <label className="text-sm font-medium mb-1 block">Model</label>
                              <Select 
                                value={activeFilters.model} 
                                onValueChange={(value) => {
                                  const newFilters = { ...activeFilters, model: value };
                                  delete newFilters.year;
                                  applyFilters(newFilters);
                                }}
                                disabled={!activeFilters.make}
                              >
                                <SelectTrigger className="text-sm h-9">
                                  <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {models?.map((model: string) => (
                                    <SelectItem key={model} value={model}>{model}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Year */}
                            <div>
                              <label className="text-sm font-medium mb-1 block">Year</label>
                              <Select 
                                value={activeFilters.year} 
                                onValueChange={(value) => {
                                  applyFilters({ ...activeFilters, year: value });
                                }}
                                disabled={!activeFilters.make || !activeFilters.model}
                              >
                                <SelectTrigger className="text-sm h-9">
                                  <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years?.map((year: number) => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Price Range */}
                    <Accordion type="single" collapsible className="mb-4">
                      <AccordionItem value="price" className="border-b-0">
                        <AccordionTrigger className="text-base font-medium py-2">Price Range</AccordionTrigger>
                        <AccordionContent>
                          <form onSubmit={handlePriceRangeSubmit} className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Min</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="$"
                                  className="h-9"
                                  value={priceRange.min || ''}
                                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Max</label>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="$"
                                  className="h-9"
                                  value={priceRange.max || ''}
                                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                />
                              </div>
                            </div>
                            <Button type="submit" className="w-full h-9 text-sm">Apply</Button>
                          </form>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    {/* Availability */}
                    <div className="mb-6">
                      <h3 className="text-base font-medium mb-3">Availability</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Checkbox 
                            id="mobileInStock" 
                            checked={activeFilters.inStock}
                            onCheckedChange={(checked) => {
                              applyFilters({ ...activeFilters, inStock: checked as boolean || undefined });
                            }}
                          />
                          <label htmlFor="mobileInStock" className="ml-2 text-sm">In Stock Only</label>
                        </div>
                        <div className="flex items-center">
                          <Checkbox 
                            id="mobileOnSale" 
                            checked={activeFilters.onSale}
                            onCheckedChange={(checked) => {
                              applyFilters({ ...activeFilters, onSale: checked as boolean || undefined });
                            }}
                          />
                          <label htmlFor="mobileOnSale" className="ml-2 text-sm">On Sale</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DrawerFooter>
                    <Button 
                      variant="outline" 
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                    <DrawerClose asChild>
                      <Button>Apply Filters</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
              
              <div className="flex items-center justify-between w-full sm:w-auto sm:ml-auto gap-3">
                {/* View Mode Toggles */}
                <div className="hidden sm:flex border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none px-3 ${viewMode === 'grid' ? 'bg-secondary text-white' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`rounded-none px-3 ${viewMode === 'list' ? 'bg-secondary text-white' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Sort Options */}
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="h-9 w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest Arrivals</SelectItem>
                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results Counter */}
            <div className="text-sm text-gray-500 mb-6">
              {showLoading ? (
                <Skeleton className="h-5 w-40" />
              ) : (
                <>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)} of {totalProducts} products
                </>
              )}
            </div>
            
            {/* Products Grid/List */}
            {showLoading ? (
              // Loading skeletons
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4">
                    <Skeleton className="w-full h-56 rounded-md" />
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
            ) : productsError ? (
              // Error state
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">Error loading products. Please try again later.</div>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : products.length === 0 ? (
              // Empty state
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any products matching your criteria.
                </p>
                <Button onClick={clearAllFilters}>Clear All Filters</Button>
              </div>
            ) : (
              // Products display
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {products.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {!showLoading && totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {/* Generate page numbers with ellipsis for many pages */}
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pageNumber = i + 1;
                    
                    // Always show first, last, current and adjacent pages
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNumber);
                            }}
                            isActive={pageNumber === currentPage}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <PaginationItem key={pageNumber}>
                          <span className="px-4 py-2">...</span>
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductsPage;
