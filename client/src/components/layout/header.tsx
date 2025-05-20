import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Menu, 
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useMobile } from "@/hooks/use-mobile";

const Header = () => {
  const [location] = useLocation();
  const { isMobile } = useMobile();
  const { items: cartItems, openCart } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

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

    fetchCategories();
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent scrolling when menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  return (
    <header className={`bg-white shadow-md fixed w-full z-50 transition-shadow ${isScrolled ? 'shadow-lg' : 'shadow-md'}`}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-200">
          <div className="hidden md:flex space-x-4">
            <a href="#" className="text-dark hover:text-primary transition">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                Dealer Locator
              </span>
            </a>
            <a href="#" className="text-dark hover:text-primary transition">
              <span className="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                (800) 555-UTVS
              </span>
            </a>
          </div>
          <div className="flex space-x-4">
            <Link href="/track-order" className="text-dark hover:text-primary transition">Track Order</Link>
            <Link href="/contact" className="text-dark hover:text-primary transition">Support</Link>
            <Link href="/login" className="text-dark hover:text-primary transition">Login</Link>
          </div>
        </div>
        
        {/* Main Navigation */}
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-secondary font-heading">Taylor<span className="text-primary">Made</span></span>
            <span className="text-sm font-medium ml-1 text-dark">PERFORMANCE</span>
          </Link>
          
          {/* Search */}
          <div className="hidden md:flex relative mx-4 flex-grow max-w-xl">
            <form onSubmit={handleSearch} className="w-full flex">
              <Input
                type="text"
                placeholder="Search parts, brands, models..."
                className="w-full py-2 px-4 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                className="bg-primary text-white px-4 rounded-l-none rounded-r-md hover:bg-primary/90"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
          
          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-dark hover:text-primary"
              onClick={() => window.location.href = "/search"}
            >
              <Search className="h-6 w-6" />
            </Button>
            <Link href="/wishlist" className="text-dark hover:text-primary relative inline-flex">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-dark hover:text-primary relative"
              onClick={openCart}
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-dark hover:text-primary"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        
        {/* Category Navigation */}
        <nav className="hidden lg:block pb-4">
          <ul className="flex justify-between">
            {categories.map((category) => (
              <li key={category.id} className="mega-menu-container group relative">
                <Link 
                  href={`/categories/${category.slug}`}
                  className="block py-2 px-4 font-heading font-semibold hover:text-primary transition"
                >
                  {category.name}
                  <ChevronDown className="h-4 w-4 ml-1 inline-block" />
                </Link>
                <div className="mega-menu absolute left-0 w-full bg-white shadow-lg p-6 grid grid-cols-4 gap-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-lg border-b border-gray-200 pb-2">Popular Categories</h4>
                    <ul className="space-y-1">
                      <li><Link href="#" className="text-dark hover:text-primary">Performance Exhausts</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Suspension Upgrades</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Wheels & Tires</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Engine Components</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Body & Appearance</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-lg border-b border-gray-200 pb-2">By Model</h4>
                    <ul className="space-y-1">
                      <li><Link href="#" className="text-dark hover:text-primary">RZR XP 1000</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">RZR Pro XP</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">RZR Turbo S</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">RZR 900</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">RZR 570</Link></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-heading font-bold text-lg border-b border-gray-200 pb-2">Top Brands</h4>
                    <ul className="space-y-1">
                      <li><Link href="#" className="text-dark hover:text-primary">Pro Armor</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">K&N</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Fox Racing</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">Method Race Wheels</Link></li>
                      <li><Link href="#" className="text-dark hover:text-primary">SuperATV</Link></li>
                    </ul>
                  </div>
                  <div>
                    <img 
                      src="https://pixabay.com/get/ge6ccaac9d897f9726a7ee43e34f6d90f9a9b7535572f2edadd1bc473ddaadcff1b46126896b143b5f8405cd1ccdb49a046c11c8451a937b49b7790107b65b344_1280.jpg" 
                      alt={`${category.name} in action`} 
                      className="rounded-lg shadow-md w-full h-auto"
                    />
                    <Link 
                      href={`/categories/${category.slug}`} 
                      className="block mt-2 text-primary font-semibold hover:underline"
                    >
                      Shop All {category.name} <ChevronRight className="h-4 w-4 ml-1 inline-block" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
            <li className="mega-menu-container group relative">
              <Link 
                href="/deals" 
                className="block py-2 px-4 font-heading font-semibold text-accent hover:text-primary transition"
              >
                Deals
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline-block" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/>
                </svg>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
