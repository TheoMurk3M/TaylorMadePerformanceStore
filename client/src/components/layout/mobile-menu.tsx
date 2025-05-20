import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, ChevronDown, ChevronUp, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MobileMenuProps {}

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Toggle body scroll when menu is open/closed
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Listen for mobile menu toggle event from header
  useEffect(() => {
    const handleMenuToggle = (e: CustomEvent) => {
      setIsOpen(e.detail.isOpen);
    };

    window.addEventListener('toggleMobileMenu' as any, handleMenuToggle);

    return () => {
      window.removeEventListener('toggleMobileMenu' as any, handleMenuToggle);
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const toggleCategory = (categoryId: number) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
      setIsOpen(false);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white transform transition-transform duration-300 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <span className="text-xl font-bold text-secondary font-heading">Menu</span>
          <Button variant="ghost" size="icon" onClick={closeMenu} aria-label="Close menu">
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="py-4">
          <div className="mb-4">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Search parts..."
                className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
          
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id} className="border-b border-gray-100">
                <div className="flex justify-between items-center w-full py-3">
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="text-left font-heading font-semibold flex-grow"
                    onClick={closeMenu}
                  >
                    {category.name}
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-auto"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {expandedCategory === category.id ? 
                      <ChevronUp className="h-5 w-5" /> : 
                      <ChevronDown className="h-5 w-5" />
                    }
                  </Button>
                </div>
                
                {expandedCategory === category.id && (
                  <div className="pl-4 pb-2 space-y-2">
                    <Link 
                      href={`/categories/${category.slug}/popular`}
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={closeMenu}
                    >
                      Popular Items
                    </Link>
                    <Link 
                      href={`/categories/${category.slug}/new-arrivals`}
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={closeMenu}
                    >
                      New Arrivals
                    </Link>
                    <Link 
                      href={`/categories/${category.slug}/best-selling`}
                      className="block py-2 text-gray-600 hover:text-primary"
                      onClick={closeMenu}
                    >
                      Best Selling
                    </Link>
                  </div>
                )}
              </li>
            ))}
            
            <li className="border-b border-gray-100">
              <Link 
                href="/deals" 
                className="block py-3 font-heading font-semibold text-accent"
                onClick={closeMenu}
              >
                Deals
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                </svg>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/login" 
              className="block py-2 px-4 text-center border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={closeMenu}
            >
              Login
            </Link>
            <Link 
              href="/register" 
              className="block py-2 px-4 text-center bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={closeMenu}
            >
              Register
            </Link>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-primary mr-2" />
              <span className="text-dark">Dealer Locator</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-primary mr-2" />
              <span className="text-dark">(800) 555-UTVS</span>
            </div>
            <Link 
              href="/track-order" 
              className="flex items-center text-dark hover:text-primary"
              onClick={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Track Order
            </Link>
            <Link 
              href="/contact" 
              className="flex items-center text-dark hover:text-primary"
              onClick={closeMenu}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
