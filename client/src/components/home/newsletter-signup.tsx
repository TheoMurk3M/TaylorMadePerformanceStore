import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { insertSubscriberSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof formSchema>;

const NewsletterSignup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email: data.email,
      });
      
      setIsSuccess(true);
      form.reset();
      
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter.",
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-heading text-white mb-4">Join Our Community</h2>
          <p className="text-lg text-white/80 mb-8">
            Subscribe to our newsletter for exclusive deals, new product alerts, and expert UTV performance tips.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Your email address"
                        className="py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-white w-full"
                        {...field}
                        disabled={isSubmitting || isSuccess}
                      />
                    </FormControl>
                    <FormMessage className="text-white/90 text-sm mt-1" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold py-3 px-6 rounded-md transition whitespace-nowrap"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Subscribed
                  </span>
                ) : (
                  <span className="flex items-center">
                    Subscribe
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </form>
          </Form>
          
          <p className="text-sm text-white/60 mt-4">
            By subscribing, you agree to our Privacy Policy. We'll never share your information.
          </p>
        </div>
      </div>
    </section>
  );
};

const ChevronRightIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default NewsletterSignup;
