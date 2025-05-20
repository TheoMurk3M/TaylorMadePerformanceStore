import HeroSection from "@/components/home/hero-section";
import FeaturedCategories from "@/components/home/featured-categories";
import FeaturedProducts from "@/components/home/featured-products";
import FeaturedBrands from "@/components/home/featured-brands";
import FitmentTool from "@/components/home/fitment-tool";
import Testimonials from "@/components/home/testimonials";
import PromoBanner from "@/components/home/promo-banner";
import FeaturedArticles from "@/components/home/featured-articles";
import NewsletterSignup from "@/components/home/newsletter-signup";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Taylor Made Performance UTV Parts - Premium Aftermarket Side-by-Side Parts</title>
        <meta name="description" content="Upgrade your UTV with premium performance parts. Exhausts, suspension, wheels & tires, engine parts, lighting, and protection for Polaris, Can-Am, Honda, Yamaha, and Kawasaki." />
      </Helmet>
      
      {/* Hero Section with Carousel */}
      <HeroSection />
      
      {/* Featured Categories */}
      <FeaturedCategories />
      
      {/* Featured Products */}
      <FeaturedProducts />
      
      {/* Featured Brands */}
      <FeaturedBrands />
      
      {/* Fitment Tool */}
      <FitmentTool />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Promo Banner */}
      <PromoBanner />
      
      {/* Featured Articles/Blog */}
      <FeaturedArticles />
      
      {/* Newsletter Signup */}
      <NewsletterSignup />
    </>
  );
};

export default Home;
