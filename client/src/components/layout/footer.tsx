import { Link } from "wouter";
import { Facebook, Instagram, Youtube, Twitter, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-bold text-white font-heading">Taylor<span className="text-primary">Made</span></span>
              <span className="text-sm font-medium ml-1 text-gray-300">PERFORMANCE</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Dedicated to providing the highest quality aftermarket performance parts for UTVs. Our products are designed to enhance performance, durability, and style.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://instagram.com" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://youtube.com" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="YouTube">
                <Youtube size={18} />
              </a>
              <a href="https://twitter.com" className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-primary transition-colors">Shop All</Link></li>
              <li><Link href="/deals" className="text-gray-400 hover:text-primary transition-colors">Deals & Promotions</Link></li>
              <li><Link href="/brands" className="text-gray-400 hover:text-primary transition-colors">Brand Directory</Link></li>
              <li><Link href="/gift-cards" className="text-gray-400 hover:text-primary transition-colors">Gift Cards</Link></li>
              <li><Link href="/become-dealer" className="text-gray-400 hover:text-primary transition-colors">Become a Dealer</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/track-order" className="text-gray-400 hover:text-primary transition-colors">Order Tracking</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold font-heading mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mt-1 mr-3" />
                <span className="text-gray-400">1234 Performance Drive<br />Offroad City, CA 92345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-400">(800) 555-UTVS</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-400">info@taylormadeperformance.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-3" />
                <span className="text-gray-400">Mon-Fri: 9AM - 6PM PST</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">&copy; {new Date().getFullYear()} Taylor Made Performance UTV Parts. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 text-sm hover:text-gray-300 transition-colors">Terms of Service</Link>
              <div className="flex items-center ml-6">
                <img 
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/visa.svg" 
                  alt="Visa" 
                  className="h-6 w-10 opacity-70"
                />
                <img 
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/mastercard.svg" 
                  alt="Mastercard" 
                  className="h-6 w-10 opacity-70"
                />
                <img 
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/americanexpress.svg" 
                  alt="American Express" 
                  className="h-6 w-10 opacity-70"
                />
                <img 
                  src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/paypal.svg" 
                  alt="PayPal" 
                  className="h-6 w-10 opacity-70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
