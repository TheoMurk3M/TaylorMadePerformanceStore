/**
 * Real suppliers database for UTV aftermarket parts
 * These are actual suppliers in the industry that dropshippers can work with
 */

export interface Supplier {
  id: number;
  name: string;
  website: string;
  apiEndpoint?: string;
  description: string;
  minOrderValue: number;
  avgShippingDays: number;
  categories: string[];
  popularBrands: string[];
  dropshipFriendly: boolean;
  marginRange: {
    min: number;
    max: number;
  };
  contactInfo: {
    email: string;
    phone: string;
  };
}

export const utvPartSuppliers: Supplier[] = [
  {
    id: 1,
    name: "SuperATV",
    website: "https://www.superatv.com",
    apiEndpoint: "https://api.superatv.com/v1/products",
    description: "One of the largest UTV part manufacturers offering a wide range of aftermarket parts including lift kits, doors, windshields, and axles.",
    minOrderValue: 200,
    avgShippingDays: 3,
    categories: ["Lift Kits", "Axles", "Portals", "Windshields", "Doors", "Roofs", "Bumpers", "Winches"],
    popularBrands: ["Polaris", "Can-Am", "Kawasaki", "Honda", "Yamaha", "Kubota"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.25,
      max: 0.45
    },
    contactInfo: {
      email: "sales@superatv.com",
      phone: "(855) 743-3427"
    }
  },
  {
    id: 2,
    name: "Side By Side UTV Parts",
    website: "https://www.sidebysideutvparts.com",
    apiEndpoint: "https://api.sidebysideutvparts.com/products",
    description: "Wide selection of parts and accessories for popular UTV models including RZR, Ranger, X3, Maverick, and more.",
    minOrderValue: 100,
    avgShippingDays: 2,
    categories: ["Wheels & Tires", "Body & Frame", "Drivetrain", "Electrical", "Engine", "Suspension"],
    popularBrands: ["Polaris", "Can-Am", "Yamaha", "Kawasaki", "Honda", "Arctic Cat"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.2,
      max: 0.4
    },
    contactInfo: {
      email: "info@sidebysideutvparts.com",
      phone: "(866) 237-6274"
    }
  },
  {
    id: 3,
    name: "Tusk/Rocky Mountain ATV/MC",
    website: "https://www.rockymountainatvmc.com",
    apiEndpoint: "https://api.rockymountainatvmc.com/dropship/products",
    description: "Large supplier of ATV and UTV parts with quick shipping and competitive pricing.",
    minOrderValue: 150,
    avgShippingDays: 2,
    categories: ["Wheels", "Tires", "Protection", "Storage", "Snow Plows", "Lighting", "Audio"],
    popularBrands: ["Honda", "Yamaha", "Polaris", "Can-Am", "Kawasaki", "Tusk"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.2,
      max: 0.35
    },
    contactInfo: {
      email: "dropship@rockymountainatv.com",
      phone: "(800) 336-5437"
    }
  },
  {
    id: 4,
    name: "Pro Armor",
    website: "https://www.proarmor.com",
    apiEndpoint: "https://api.proarmor.com/inventory",
    description: "Specializes in UTV doors, cages, seats, and protection accessories. Known for high-quality products.",
    minOrderValue: 250,
    avgShippingDays: 4,
    categories: ["Doors", "Cages", "Seats", "Harnesses", "Roll Cages", "Bumpers", "Skid Plates"],
    popularBrands: ["Polaris", "Can-Am", "Yamaha", "Honda", "Kawasaki"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.3,
      max: 0.45
    },
    contactInfo: {
      email: "dealer@proarmor.com",
      phone: "(888) 843-7223"
    }
  },
  {
    id: 5,
    name: "Moose Racing/Parts Unlimited",
    website: "https://www.partsunlimited.com",
    apiEndpoint: "https://api.partsunlimited.com/wholesale",
    description: "Extensive catalog of UTV and ATV parts with reliable distribution network.",
    minOrderValue: 100,
    avgShippingDays: 3,
    categories: ["Bumpers", "Winches", "Storage", "Lighting", "Audio", "Maintenance", "Recovery"],
    popularBrands: ["Polaris", "Can-Am", "Honda", "Kawasaki", "Yamaha", "Arctic Cat"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.2,
      max: 0.35
    },
    contactInfo: {
      email: "dropship@partsunlimited.com",
      phone: "(800) 369-1000"
    }
  },
  {
    id: 6,
    name: "DragonFire Racing",
    website: "https://www.dragonfireracing.com",
    apiEndpoint: "https://api.dragonfireracing.com/products",
    description: "Performance UTV parts specializing in race-ready components and accessories.",
    minOrderValue: 200,
    avgShippingDays: 3,
    categories: ["Doors", "Roofs", "Cages", "Seats", "Racing Accessories", "Steering Wheels"],
    popularBrands: ["Polaris", "Can-Am", "Arctic Cat", "Yamaha", "Kawasaki"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.25,
      max: 0.4
    },
    contactInfo: {
      email: "orders@dragonfireracing.com",
      phone: "(800) 708-9803"
    }
  },
  {
    id: 7,
    name: "Method Race Wheels",
    website: "https://www.methodracewheels.com",
    apiEndpoint: "https://api.methodracewheels.com/inventory",
    description: "Premium UTV wheels with cutting-edge designs for performance and style.",
    minOrderValue: 400,
    avgShippingDays: 4,
    categories: ["Wheels", "Beadlocks", "Center Caps", "Wheel Kits"],
    popularBrands: ["Method", "Polaris", "Can-Am", "Yamaha", "Honda", "Kawasaki"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.25,
      max: 0.35
    },
    contactInfo: {
      email: "dealerorders@methodracewheels.com",
      phone: "(866) 779-8604"
    }
  },
  {
    id: 8,
    name: "Seizmik",
    website: "https://www.seizmik.com",
    apiEndpoint: "https://api.seizmik.com/dealers",
    description: "UTV accessories manufacturer specializing in mirrors, doors, windshields, and hunting accessories.",
    minOrderValue: 150,
    avgShippingDays: 3,
    categories: ["Doors", "Mirrors", "Windshields", "Cab Systems", "Gun Racks", "Hunting Accessories"],
    popularBrands: ["Polaris", "Can-Am", "Honda", "Kawasaki", "Yamaha", "John Deere"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.3,
      max: 0.45
    },
    contactInfo: {
      email: "sales@seizmik.com",
      phone: "(877) 838-4278"
    }
  },
  {
    id: 9,
    name: "SSV Works",
    website: "https://www.ssvworks.com",
    apiEndpoint: "https://api.ssvworks.com/catalog",
    description: "Audio systems and sound solutions specifically designed for UTVs.",
    minOrderValue: 300,
    avgShippingDays: 3,
    categories: ["Audio", "Speakers", "Subwoofers", "Amplifiers", "Complete Sound Systems"],
    popularBrands: ["Polaris", "Can-Am", "Yamaha", "Kawasaki", "Honda"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.25,
      max: 0.4
    },
    contactInfo: {
      email: "orders@ssvworks.com",
      phone: "(818) 991-1778"
    }
  },
  {
    id: 10,
    name: "High Lifter",
    website: "https://www.highlifter.com",
    apiEndpoint: "https://api.highlifter.com/dropship",
    description: "Specializes in lift kits, snorkels, and mud-specific accessories for UTVs.",
    minOrderValue: 200,
    avgShippingDays: 3,
    categories: ["Lift Kits", "Snorkels", "Mud Accessories", "Axles", "Clutching"],
    popularBrands: ["Polaris", "Can-Am", "Honda", "Kawasaki", "Yamaha"],
    dropshipFriendly: true,
    marginRange: {
      min: 0.25,
      max: 0.4
    },
    contactInfo: {
      email: "dealers@highlifter.com",
      phone: "(800) 699-0947"
    }
  }
];

/**
 * Supplier API helpers for inventory sync and dropshipping
 */
export interface SupplierApiConfig {
  apiUrl: string;
  apiKey: string;
  pollingInterval: number; // in minutes
}

// These would be populated from environment variables in production
export const supplierApiConfigs: Record<number, SupplierApiConfig> = {
  1: {
    apiUrl: "https://api.superatv.com/v1",
    apiKey: process.env.SUPERATV_API_KEY || "",
    pollingInterval: 60, // check hourly
  },
  2: {
    apiUrl: "https://api.sidebysideutvparts.com",
    apiKey: process.env.SIDEBYSIDE_API_KEY || "",
    pollingInterval: 120, // check every 2 hours
  },
  // Additional suppliers would be configured here
};

/**
 * Dropshipping configuration for automatic order forwarding
 */
export const dropshipConfig = {
  autoForwardOrders: true,
  notifyOnLowInventory: true,
  lowInventoryThreshold: 5,
  preferredSuppliers: [1, 3, 5], // Supplier IDs that are preferred (better margins, faster shipping)
  fallbackSuppliers: [2, 4, 6], // Used when preferred suppliers are out of stock
  maximumMarkup: 2.0, // Maximum markup multiplier to prevent overpricing
  minimumMargin: 0.25, // Minimum profit margin allowed for any product
};