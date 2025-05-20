import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import ProductDetailComponent from "@/components/product/product-detail";
import { Helmet } from "react-helmet";

const ProductDetailPage = () => {
  const { slug } = useParams();
  
  // Fetch product data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/products/${slug}`],
    staleTime: Infinity,
  });

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Meta tags for SEO
  const metaTitle = data?.product 
    ? `${data.product.name} | Taylor Made Performance UTV Parts`
    : "Product Details | Taylor Made Performance UTV Parts";
  
  const metaDescription = data?.product
    ? `${data.product.description.substring(0, 150)}...`
    : "View detailed specifications, compatible vehicles, and customer reviews for our premium UTV performance parts.";

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        {data?.product && (
          <>
            <meta property="og:title" content={data.product.name} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={data.product.images?.[0]} />
            <meta property="og:type" content="product" />
            <meta property="og:price:amount" content={data.product.price} />
            <meta property="og:price:currency" content="USD" />
            <meta property="og:availability" content={data.product.inventoryCount > 0 ? "instock" : "outofstock"} />
          </>
        )}
      </Helmet>
      <ProductDetailComponent productSlug={slug || ""} />
    </>
  );
};

export default ProductDetailPage;
