import { useState } from "react";
import StarRating from "@/components/ui/star-rating";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Testimonial interface
interface Testimonial {
  id: number;
  name: string;
  rating: number;
  text: string;
  photoUrl?: string;
  vehicleInfo: string;
}

// Sample testimonials
const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "John D.",
    rating: 5,
    text: "The exhaust system I purchased from Taylor Made Performance completely transformed my RZR. Gained noticeable horsepower and the sound is incredible. Installation was straightforward with their guide.",
    photoUrl: "https://images.unsplash.com/photo-1568010961410-8377e76b7822?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    vehicleInfo: "Polaris RZR Pro XP Owner"
  },
  {
    id: 2,
    name: "Mike T.",
    rating: 5,
    text: "Customer service is top notch! Had questions about which suspension kit would work best for my riding style, and they took the time to walk me through all options. The kit I chose has completely changed my Maverick's handling.",
    photoUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    vehicleInfo: "Can-Am Maverick X3 Owner"
  },
  {
    id: 3,
    name: "Sarah L.",
    rating: 4.5,
    text: "Fast shipping and excellent packaging. The light bar I ordered was well protected and arrived earlier than expected. Installation was a breeze with the provided instructions. Will definitely be ordering more parts soon!",
    photoUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    vehicleInfo: "Yamaha YXZ1000R Owner"
  },
  {
    id: 4,
    name: "David R.",
    rating: 5,
    text: "I've been upgrading my Honda Talon with parts exclusively from Taylor Made Performance. The quality is outstanding, and their technical support team has been incredibly helpful in answering all my fitment questions.",
    vehicleInfo: "Honda Talon 1000X Owner"
  },
  {
    id: 5,
    name: "Jennifer K.",
    rating: 4,
    text: "The wheels and tires package I purchased has transformed my Kawasaki. The grip is amazing in all conditions and they look fantastic. Shipping was fast and the price was better than I found anywhere else.",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    vehicleInfo: "Kawasaki Teryx KRX 1000 Owner"
  }
];

const Testimonials = () => {
  const [visibleTestimonials, setVisibleTestimonials] = useState<Testimonial[]>(testimonials.slice(0, 3));
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(testimonials.length / 3);

  const handleNextPage = () => {
    const nextPage = (currentPage + 1) % totalPages;
    setCurrentPage(nextPage);
    setVisibleTestimonials(testimonials.slice(nextPage * 3, nextPage * 3 + 3));
  };

  const handlePrevPage = () => {
    const prevPage = currentPage === 0 ? totalPages - 1 : currentPage - 1;
    setCurrentPage(prevPage);
    setVisibleTestimonials(testimonials.slice(prevPage * 3, prevPage * 3 + 3));
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-heading text-secondary mb-6 text-center">What Our Customers Say</h2>
        <p className="text-gray-600 text-center mb-8 max-w-2xl mx-auto">
          Don't just take our word for it. See what UTV enthusiasts are saying about Taylor Made Performance parts and service.
        </p>
        
        {/* Desktop View - Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 relative pb-12">
          {visibleTestimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>
              <p className="text-gray-600 flex-grow">{testimonial.text}</p>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-4">
                  {testimonial.photoUrl ? (
                    <img 
                      src={testimonial.photoUrl} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-heading font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.vehicleInfo}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Buttons */}
          {totalPages > 1 && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 mt-8">
              <button 
                onClick={handlePrevPage}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="h-5 w-5 text-secondary" />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentPage(index);
                    setVisibleTestimonials(testimonials.slice(index * 3, index * 3 + 3));
                  }}
                  className={`w-2.5 h-2.5 rounded-full ${
                    currentPage === index ? "bg-primary" : "bg-gray-300"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
              <button 
                onClick={handleNextPage}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Next testimonials"
              >
                <ChevronRight className="h-5 w-5 text-secondary" />
              </button>
            </div>
          )}
        </div>
        
        {/* Mobile View - Single Testimonial */}
        <div className="md:hidden relative">
          {visibleTestimonials.slice(0, 1).map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">
              <div className="mb-4">
                <StarRating rating={testimonial.rating} />
              </div>
              <p className="text-gray-600">{testimonial.text}</p>
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden mr-4">
                  {testimonial.photoUrl ? (
                    <img 
                      src={testimonial.photoUrl} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-heading font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.vehicleInfo}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mobile Navigation Dots */}
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: testimonials.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentPage(Math.floor(index / 3));
                  setVisibleTestimonials([testimonials[index]]);
                }}
                className={`w-2.5 h-2.5 rounded-full ${
                  visibleTestimonials[0]?.id === testimonials[index]?.id ? "bg-primary" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
