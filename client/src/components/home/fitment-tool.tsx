import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const FitmentTool = () => {
  const { toast } = useToast();
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  // Fetch vehicle makes
  const { 
    data: makes, 
    isLoading: isLoadingMakes 
  } = useQuery({
    queryKey: ['/api/vehicle-makes'],
    enabled: true,
  });

  // Fetch models for the selected make
  const { 
    data: models, 
    isLoading: isLoadingModels 
  } = useQuery({
    queryKey: ['/api/vehicle-models', selectedMake],
    queryFn: async () => {
      if (!selectedMake) return [];
      const response = await fetch(`/api/vehicle-models/${selectedMake}`);
      return await response.json();
    },
    enabled: !!selectedMake,
  });

  // Fetch years for the selected make and model
  const { 
    data: years, 
    isLoading: isLoadingYears 
  } = useQuery({
    queryKey: ['/api/vehicle-years', selectedMake, selectedModel],
    queryFn: async () => {
      if (!selectedMake || !selectedModel) return [];
      const response = await fetch(`/api/vehicle-years/${selectedMake}/${selectedModel}`);
      return await response.json();
    },
    enabled: !!selectedMake && !!selectedModel,
  });

  // Reset model and year when make changes
  useEffect(() => {
    setSelectedModel("");
    setSelectedYear("");
  }, [selectedMake]);

  // Reset year when model changes
  useEffect(() => {
    setSelectedYear("");
  }, [selectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMake || !selectedModel || !selectedYear) {
      toast({
        title: "Please select all fields",
        description: "Make, model and year are required to find compatible parts.",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to products page with fitment parameters
    window.location.href = `/products?make=${encodeURIComponent(selectedMake)}&model=${encodeURIComponent(selectedModel)}&year=${encodeURIComponent(selectedYear)}`;
  };

  return (
    <section className="py-12 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="lg:flex items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
            <h2 className="text-3xl font-bold font-heading mb-4">Find the Perfect Parts for Your UTV</h2>
            <p className="text-lg mb-6 text-gray-300">Our advanced vehicle fitment tool makes it easy to find parts that are guaranteed to fit your specific make, model, and year.</p>
            
            <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="make-select" className="block text-sm font-medium mb-2">Select Make</label>
                  <Select 
                    value={selectedMake} 
                    onValueChange={setSelectedMake}
                  >
                    <SelectTrigger id="make-select" className="w-full p-3 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select Make" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingMakes ? (
                        <div className="p-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full mt-2" />
                          <Skeleton className="h-6 w-full mt-2" />
                        </div>
                      ) : (
                        makes?.map((make: string) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="model-select" className="block text-sm font-medium mb-2">Select Model</label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={!selectedMake || isLoadingModels}
                  >
                    <SelectTrigger id="model-select" className="w-full p-3 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingModels ? (
                        <div className="p-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full mt-2" />
                        </div>
                      ) : (
                        models?.map((model: string) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="year-select" className="block text-sm font-medium mb-2">Select Year</label>
                  <Select 
                    value={selectedYear} 
                    onValueChange={setSelectedYear}
                    disabled={!selectedModel || isLoadingYears}
                  >
                    <SelectTrigger id="year-select" className="w-full p-3 rounded-md bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingYears ? (
                        <div className="p-2">
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-6 w-full mt-2" />
                        </div>
                      ) : (
                        years?.map((year: number) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-md transition"
                >
                  Find My Parts
                </Button>
              </form>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1506610654-064fbba4780c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="UTV Parts Diagram" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FitmentTool;
