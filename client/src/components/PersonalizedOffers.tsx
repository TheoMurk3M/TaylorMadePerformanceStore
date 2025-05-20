/**
 * Personalized product offers component that uses the AI-driven sales optimization
 * to show targeted product recommendations based on customer behavior
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { 
  getPersonalizedOffers, 
  type FunnelOffer, 
  type PersonalizedOffersResponse 
} from '../lib/salesFunnel';
import { useAuth } from '../context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface PersonalizedOffersProps {
  currentProductId: number;
  className?: string;
}

const PersonalizedOffers: React.FC<PersonalizedOffersProps> = ({
  currentProductId,
  className = '',
}) => {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<PersonalizedOffersResponse | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const data = await getPersonalizedOffers(currentProductId, user?.id);
        
        if (data && data.offers && data.offers.length > 0) {
          setOffers(data);
        } else {
          setOffers(null);
        }
      } catch (error) {
        console.error('Error fetching personalized offers:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load personalized recommendations',
        });
        setOffers(null);
      } finally {
        setLoading(false);
      }
    };

    if (currentProductId) {
      fetchOffers();
    }
  }, [currentProductId, user?.id, toast]);

  // Don't render if there are no offers
  if (!loading && (!offers || !offers.offers || offers.offers.length === 0)) {
    return null;
  }

  return (
    <div className={`my-8 ${className}`}>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        offers && (
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center text-primary">
              {offers.message}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {offers.offers.map((offer: FunnelOffer) => (
                <Card key={offer.id} className="h-full flex flex-col">
                  <CardContent className="pt-4 flex-grow">
                    {offer.image && (
                      <div className="relative h-40 mb-3">
                        <img
                          src={offer.image}
                          alt={offer.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-lg">{offer.name}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {offer.description}
                    </p>
                    <div className="flex items-center mt-auto">
                      {offer.offerPrice ? (
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-primary">
                            ${typeof offer.offerPrice === 'number' 
                              ? offer.offerPrice.toFixed(2) 
                              : parseFloat(offer.offerPrice).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            ${typeof offer.originalPrice === 'number' 
                              ? offer.originalPrice.toFixed(2) 
                              : parseFloat(offer.originalPrice).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold">
                          ${typeof offer.originalPrice === 'number' 
                            ? offer.originalPrice.toFixed(2) 
                            : parseFloat(offer.originalPrice).toFixed(2)}
                        </span>
                      )}
                      
                      {offer.discountPercentage > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          {offer.discountPercentage}% OFF
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/products/${offer.id}`}>
                      <Button className="w-full">{offers.cta}</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PersonalizedOffers;