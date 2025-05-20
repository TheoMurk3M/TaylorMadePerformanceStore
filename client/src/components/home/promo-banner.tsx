import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  primaryCta?: {
    text: string;
    url: string;
  };
  secondaryCta?: {
    text: string;
    url: string;
  };
  backgroundImage?: string;
  badge?: string;
}

const PromoBanner = ({
  title = "Summer Performance Sale",
  subtitle = "Save up to 25% on select performance upgrades. Plus, free shipping on orders over $200!",
  primaryCta = {
    text: "Shop the Sale",
    url: "/deals"
  },
  secondaryCta = {
    text: "Learn More",
    url: "/summer-sale"
  },
  backgroundImage = "https://pixabay.com/get/g257942ec4f58343ae8f3334fd8d22714d3e513e56885f7b0e11c271322c83a6457b22c2d2d9e6f08e5bf2c703b873cebd6b220de38d8fbee5ffb675b2dcdb0ee_1280.jpg",
  badge = "LIMITED TIME"
}: PromoBannerProps) => {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative rounded-xl overflow-hidden">
          <div 
            className="h-80 bg-cover bg-center"
            style={{ backgroundImage: `url('${backgroundImage}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/70 to-transparent"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="ml-8 md:ml-16 max-w-lg">
                {badge && (
                  <div className="mb-4">
                    <span className="bg-accent text-white text-sm font-bold py-1 px-3 rounded-full">
                      {badge}
                    </span>
                  </div>
                )}
                <h2 className="text-3xl md:text-4xl font-bold text-white font-heading mb-4">
                  {title}
                </h2>
                <p className="text-lg text-white mb-6">
                  {subtitle}
                </p>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button 
                    asChild
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-bold"
                  >
                    <Link href={primaryCta.url}>
                      {primaryCta.text}
                    </Link>
                  </Button>
                  
                  {secondaryCta && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="bg-white hover:bg-gray-100 text-secondary font-bold border-0"
                    >
                      <Link href={secondaryCta.url}>
                        {secondaryCta.text}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
