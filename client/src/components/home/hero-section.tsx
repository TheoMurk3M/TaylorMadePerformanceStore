import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    url: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    imageUrl: "https://images.unsplash.com/photo-1592819695396-064b9572a660?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1000",
    title: "Unleash Your UTV's Full Potential",
    subtitle: "Premium aftermarket parts that deliver maximum performance for your side-by-side.",
    primaryCta: {
      text: "Shop Now",
      url: "/products"
    },
    secondaryCta: {
      text: "Find Your Fit",
      url: "/fitment"
    }
  },
  {
    id: 2,
    imageUrl: "https://pixabay.com/get/g257942ec4f58343ae8f3334fd8d22714d3e513e56885f7b0e11c271322c83a6457b22c2d2d9e6f08e5bf2c703b873cebd6b220de38d8fbee5ffb675b2dcdb0ee_1280.jpg",
    title: "Summer Performance Sale",
    subtitle: "Save up to 25% on select performance upgrades. Plus, free shipping on orders over $200!",
    primaryCta: {
      text: "Shop the Sale",
      url: "/deals"
    },
    secondaryCta: {
      text: "Learn More",
      url: "/summer-sale"
    }
  },
  {
    id: 3,
    imageUrl: "https://pixabay.com/get/gbb2d7177ffa9a5ecbbb8568588ae6857b9cface69b6d4460f7aad7fa5669b5d14b2581a2ededeee891442e0d334d1ba6cd733c5694b85e33e3feb1da3c0c92ea_1280.jpg",
    title: "Trail-Ready Performance",
    subtitle: "Upgrade your ride with the latest in UTV innovation. Built for the toughest terrain.",
    primaryCta: {
      text: "Discover Now",
      url: "/collections/trail-ready"
    }
  }
];

const HeroSection: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Advance to next slide
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Go to previous slide
  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    
    return () => clearInterval(interval);
  }, [activeSlide, isTransitioning]);

  return (
    <section className="relative overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Main Carousel */}
        <div className="relative rounded-xl overflow-hidden shadow-lg bg-secondary">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 h-[400px] md:h-[500px] bg-cover bg-center transition-all duration-500 ${
                index === activeSlide 
                  ? "opacity-100 z-10" 
                  : "opacity-0 z-0"
              }`}
              style={{ backgroundImage: `url('${slide.imageUrl}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent flex items-center">
                <div className="text-white p-8 md:p-12 max-w-xl">
                  <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
                    {slide.title.split(' ').map((word, i, arr) => 
                      i === arr.length - 1 
                        ? <span key={i} className="text-accent">{word} </span> 
                        : <span key={i}>{word} </span>
                    )}
                  </h1>
                  <p className="text-lg md:text-xl mb-8 text-gray-100">{slide.subtitle}</p>
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-white font-bold"
                    >
                      <Link href={slide.primaryCta.url}>
                        {slide.primaryCta.text}
                      </Link>
                    </Button>
                    
                    {slide.secondaryCta && (
                      <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="bg-white hover:bg-gray-100 text-secondary font-bold border-0"
                      >
                        <Link href={slide.secondaryCta.url}>
                          {slide.secondaryCta.text}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel Controls */}
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors backdrop-blur-sm"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Indicator Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === activeSlide 
                    ? "bg-white w-4" 
                    : "bg-white/50"
                }`}
                onClick={() => {
                  setIsTransitioning(true);
                  setActiveSlide(index);
                  setTimeout(() => setIsTransitioning(false), 500);
                }}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
