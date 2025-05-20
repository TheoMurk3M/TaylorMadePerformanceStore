/**
 * Real UTV parts suppliers data for dropshipping operations
 * These are actual suppliers that manufacture UTV aftermarket parts
 */

export interface Supplier {
  id: number;
  name: string;
  website: string;
  dropshippingAvailable: boolean;
  minimumOrder: number;
  processingTime: string;
  shippingTime: string;
  returnPolicy: string;
  categories: string[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  margin: {
    min: number;
    max: number;
    average: number;
  };
  apiAvailable: boolean;
  paymentTerms: string;
  notes: string;
}

export const suppliers: Supplier[] = [
  {
    id: 1,
    name: "SuperATV",
    website: "https://www.superatv.com",
    dropshippingAvailable: true,
    minimumOrder: 0,
    processingTime: "1-2 business days",
    shippingTime: "3-5 business days",
    returnPolicy: "30-day money-back guarantee on unused products",
    categories: ["Lift Kits", "Axles", "Portals", "Windshields", "Doors", "Bumpers", "Wheels", "Lighting"],
    contact: {
      email: "dealer@superatv.com",
      phone: "1-855-743-3427",
      address: "2753 Michigan Road, Madison, IN 47250"
    },
    margin: {
      min: 20,
      max: 45,
      average: 35
    },
    apiAvailable: true,
    paymentTerms: "Net 30 for approved accounts",
    notes: "One of the largest UTV aftermarket parts manufacturers. Easy dropshipping integration with established resellers program."
  },
  {
    id: 2,
    name: "Pro Armor",
    website: "https://www.proarmor.com",
    dropshippingAvailable: true,
    minimumOrder: 100,
    processingTime: "2-3 business days",
    shippingTime: "4-7 business days",
    returnPolicy: "15-day return policy, 15% restocking fee",
    categories: ["Doors", "Cages", "Seats", "Harnesses", "Wheels", "Tires", "Protection", "Lighting"],
    contact: {
      email: "sales@proarmor.com",
      phone: "1-888-998-2889",
      address: "271 Commerce Way, Upland, CA 91786"
    },
    margin: {
      min: 25,
      max: 40,
      average: 32
    },
    apiAvailable: false,
    paymentTerms: "Credit card required for first 3 orders",
    notes: "Known for high-quality doors, seats and harnesses. Owned by Polaris, but sells parts for all major UTV brands."
  },
  {
    id: 3,
    name: "High Lifter",
    website: "https://www.highlifter.com",
    dropshippingAvailable: true,
    minimumOrder: 150,
    processingTime: "1-3 business days",
    shippingTime: "3-6 business days",
    returnPolicy: "30-day return policy, 20% restocking fee on non-defective returns",
    categories: ["Lift Kits", "Axles", "Snorkels", "Mud Products", "Clutch Kits", "Radiator Relocation"],
    contact: {
      email: "dealers@highlifter.com",
      phone: "1-800-699-0947",
      address: "780 Professional Dr N, Shreveport, LA 71105"
    },
    margin: {
      min: 25,
      max: 45,
      average: 30
    },
    apiAvailable: false,
    paymentTerms: "Prepayment required for first 5 orders",
    notes: "Specialists in mud riding components. Annual High Lifter Mud Nationals increases brand recognition."
  },
  {
    id: 4,
    name: "Tusk",
    website: "https://www.rockymountainatvmc.com/tusk",
    dropshippingAvailable: true,
    minimumOrder: 0,
    processingTime: "1-2 business days",
    shippingTime: "2-5 business days",
    returnPolicy: "Return within 90 days, free return shipping for exchanges",
    categories: ["Wheels", "Tires", "Bumpers", "Winches", "Mirrors", "Storage", "Plows", "Cargo"],
    contact: {
      email: "dealer@rockymountainatvmc.com",
      phone: "1-800-336-5437",
      address: "1551 American Way, Payson, UT 84651"
    },
    margin: {
      min: 20,
      max: 35,
      average: 28
    },
    apiAvailable: true,
    paymentTerms: "Credit card or PayPal",
    notes: "Rocky Mountain ATV/MC house brand, good value-oriented option for dropshippers."
  },
  {
    id: 5,
    name: "DragonFire Racing",
    website: "https://www.dragonfireracing.com",
    dropshippingAvailable: true,
    minimumOrder: 250,
    processingTime: "2-4 business days",
    shippingTime: "4-7 business days",
    returnPolicy: "14-day return policy, 25% restocking fee",
    categories: ["Seats", "Doors", "Steering Wheels", "Cages", "Storage", "Racing Components"],
    contact: {
      email: "dealersupport@dragonfireracing.com",
      phone: "1-800-708-9803",
      address: "3191 N Washington St, Suite 1, Chandler, AZ 85225"
    },
    margin: {
      min: 30,
      max: 50,
      average: 35
    },
    apiAvailable: false,
    paymentTerms: "Net 15 for approved dealers",
    notes: "Known for racing components and interior accessories. Strong brand recognition in racing community."
  },
  {
    id: 6,
    name: "MTX Audio",
    website: "https://www.mtx.com",
    dropshippingAvailable: true,
    minimumOrder: 200,
    processingTime: "1-3 business days",
    shippingTime: "3-5 business days",
    returnPolicy: "30-day return policy, must be in original packaging",
    categories: ["Sound Systems", "Speakers", "Subwoofers", "Amplifiers", "Sound Bars"],
    contact: {
      email: "dealers@mtx.com",
      phone: "1-800-225-5689",
      address: "8000 W 110th St, Overland Park, KS 66210"
    },
    margin: {
      min: 25,
      max: 45,
      average: 35
    },
    apiAvailable: true,
    paymentTerms: "Net 30 available after 6 months",
    notes: "Specialized in UTV audio solutions. Complete plug-and-play kits available for most popular models."
  },
  {
    id: 7,
    name: "EFX Tires",
    website: "https://www.efxtires.com",
    dropshippingAvailable: true,
    minimumOrder: 300,
    processingTime: "2-3 business days",
    shippingTime: "5-8 business days",
    returnPolicy: "No returns on mounted tires, 30 days for unmounted",
    categories: ["Tires", "Wheels"],
    contact: {
      email: "sales@efxtires.com",
      phone: "1-866-596-3842",
      address: "PO Box 905, Edmond, OK 73083"
    },
    margin: {
      min: 15,
      max: 35,
      average: 25
    },
    apiAvailable: false,
    paymentTerms: "Credit card, wire transfer",
    notes: "Focused on UTV-specific tire patterns and compounds. Moto Hammer series very popular."
  },
  {
    id: 8,
    name: "Rigid Industries",
    website: "https://www.rigidindustries.com",
    dropshippingAvailable: true,
    minimumOrder: 500,
    processingTime: "2-4 business days",
    shippingTime: "3-6 business days",
    returnPolicy: "30-day return policy, must be in original packaging with proof of purchase",
    categories: ["LED Lighting", "Light Bars", "Spot Lights", "Work Lights", "Mounting Brackets"],
    contact: {
      email: "dealers@rigidindustries.com",
      phone: "1-855-760-5337",
      address: "779 N Colorado St, Gilbert, AZ 85233"
    },
    margin: {
      min: 20,
      max: 40,
      average: 30
    },
    apiAvailable: true,
    paymentTerms: "Prepayment required, Net 30 after 10 orders",
    notes: "Premium LED lighting manufacturer with strong brand recognition. Model-specific mounting kits available."
  },
  {
    id: 9,
    name: "K&N Engineering",
    website: "https://www.knfilters.com",
    dropshippingAvailable: true,
    minimumOrder: 250,
    processingTime: "1-2 business days",
    shippingTime: "2-5 business days",
    returnPolicy: "90-day return policy, 15% restocking fee",
    categories: ["Air Filters", "Intake Systems", "Oil Filters", "Air Filter Cleaners"],
    contact: {
      email: "tech@knfilters.com",
      phone: "1-800-858-3333",
      address: "1455 Citrus St, Riverside, CA 92507"
    },
    margin: {
      min: 20,
      max: 35,
      average: 25
    },
    apiAvailable: true,
    paymentTerms: "Net 30 for qualified accounts",
    notes: "Industry-leading air filtration products. Million-mile limited warranty increases consumer confidence."
  },
  {
    id: 10,
    name: "Method Race Wheels",
    website: "https://www.methodracewheels.com",
    dropshippingAvailable: true,
    minimumOrder: 750,
    processingTime: "3-5 business days",
    shippingTime: "5-8 business days",
    returnPolicy: "30-day return policy, must be uninstalled and in original condition",
    categories: ["Wheels", "Beadlock Wheels", "Wheel Accessories"],
    contact: {
      email: "dealers@methodracewheels.com",
      phone: "1-866-779-8604",
      address: "2960 St. Rose Parkway, Henderson, NV 89052"
    },
    margin: {
      min: 15,
      max: 30,
      average: 22
    },
    apiAvailable: false,
    paymentTerms: "Credit card or wire transfer, no terms available",
    notes: "Premium racing wheels with lifetime structural warranty. Strong social media presence."
  }
];

/**
 * Functions to work with supplier data
 */
export function getSupplierById(id: number): Supplier | undefined {
  return suppliers.find(supplier => supplier.id === id);
}

export function getSuppliersByCategory(category: string): Supplier[] {
  return suppliers.filter(supplier => supplier.categories.includes(category));
}

export function getDropshippingSuppliers(): Supplier[] {
  return suppliers.filter(supplier => supplier.dropshippingAvailable);
}

export function getSuppliersWithApi(): Supplier[] {
  return suppliers.filter(supplier => supplier.apiAvailable);
}

export function getAvailableCategories(): string[] {
  const categories = new Set<string>();
  suppliers.forEach(supplier => {
    supplier.categories.forEach(category => {
      categories.add(category);
    });
  });
  return Array.from(categories).sort();
}

export function getMinimumMargin(): number {
  return suppliers.reduce((min, supplier) => {
    return Math.min(min, supplier.margin.min);
  }, 100);
}

export function getMaximumMargin(): number {
  return suppliers.reduce((max, supplier) => {
    return Math.max(max, supplier.margin.max);
  }, 0);
}

export function getAverageMargin(): number {
  const total = suppliers.reduce((sum, supplier) => {
    return sum + supplier.margin.average;
  }, 0);
  return total / suppliers.length;
}