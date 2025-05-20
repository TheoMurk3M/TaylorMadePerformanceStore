/**
 * Real UTV parts and accessories database
 * These are actual products dropshippers can source from suppliers
 */
import { Supplier, utvPartSuppliers } from './suppliers';

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  features: string[];
  price: number;
  compareAtPrice: number | null;
  costPrice: number; // Actual cost from supplier (for profit margin calculation)
  brandId: number;
  categoryId: number;
  supplierId: number; // Reference to the supplier
  fitment: {
    makes: string[];
    models: string[];
    years: number[];
  };
  images: string[];
  inventoryCount: number;
  weight: number; // in pounds
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isFeatured: boolean;
  isPopular: boolean;
  rating: number;
  reviewCount: number;
  tags: string[];
  videoUrl?: string;
  installationTime: string; // e.g., "30-60 minutes"
  installationDifficulty: string; // "Easy", "Moderate", "Advanced"
  metaTitle: string;
  metaDescription: string;
  dateAdded: Date;
}

export const utvProducts: Product[] = [
  // SuperATV Products (Supplier ID: 1)
  {
    id: 1,
    name: "SuperATV Heavy Duty Rhino 2.0 Axle for Polaris RZR XP 1000",
    slug: "superatv-heavy-duty-rhino-axle-polaris-rzr-xp-1000",
    sku: "SAT-AX-P-RZR1K-RHINO2",
    description: "SuperATV's Rhino 2.0 axles are the strongest and most durable axles on the market. Designed specifically for high horsepower machines and aggressive riders. Perfect upgrade for your Polaris RZR XP 1000.",
    features: [
      "100% stronger than stock axles",
      "Heat-treated chromoly material",
      "Larger diameter CVs and shafts for maximum strength",
      "Precision machined for perfect fitment",
      "American made with lifetime warranty"
    ],
    price: 349.95,
    compareAtPrice: 399.95,
    costPrice: 220.00,
    brandId: 1,
    categoryId: 2,
    supplierId: 1,
    fitment: {
      makes: ["Polaris"],
      models: ["RZR XP 1000", "RZR XP 4 1000"],
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://superatv.com/rhino-2-axles-polaris-rzr-xp-1000-front-1.jpg",
      "https://superatv.com/rhino-2-axles-polaris-rzr-xp-1000-rear-1.jpg",
      "https://superatv.com/rhino-2-axles-polaris-rzr-xp-1000-detail-1.jpg"
    ],
    inventoryCount: 54,
    weight: 22.5,
    dimensions: {
      length: 36,
      width: 12,
      height: 6
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 176,
    tags: ["axle", "drivetrain", "heavy duty", "performance", "polaris", "rzr"],
    videoUrl: "https://www.youtube.com/watch?v=xYZK5DMU1Ys",
    installationTime: "60-90 minutes",
    installationDifficulty: "Moderate",
    metaTitle: "SuperATV Heavy Duty Rhino 2.0 Axle for Polaris RZR XP 1000 | Taylor Made Performance",
    metaDescription: "Upgrade your Polaris RZR XP 1000 with SuperATV's Rhino 2.0 Axles - 100% stronger than stock, heat-treated chromoly with lifetime warranty. Free shipping!",
    dateAdded: new Date("2022-08-15")
  },
  {
    id: 2,
    name: "SuperATV 6" Lift Kit for Polaris Ranger 1000 XP",
    slug: "superatv-6-inch-lift-kit-polaris-ranger-1000-xp",
    sku: "SAT-LK-P-RAN1K-6",
    description: "Take your Ranger's ground clearance and performance to new heights with SuperATV's 6" Lift Kit. This comprehensive kit includes everything needed for a complete transformation, allowing for larger tires and improved off-road capabilities.",
    features: [
      "Includes front and rear brackets, A-arms, and trailing arms",
      "High-clearance design for extreme terrain",
      "Maintains factory geometry for ride quality",
      "Accommodates up to 35" tires",
      "Made from 100% American steel",
      "Complete hardware and instructions included"
    ],
    price: 1799.95,
    compareAtPrice: 1999.95,
    costPrice: 1100.00,
    brandId: 1,
    categoryId: 1,
    supplierId: 1,
    fitment: {
      makes: ["Polaris"],
      models: ["Ranger 1000 XP", "Ranger 1000 XP Crew"],
      years: [2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://superatv.com/6-inch-lift-kit-polaris-ranger-1000-main.jpg",
      "https://superatv.com/6-inch-lift-kit-polaris-ranger-1000-side.jpg",
      "https://superatv.com/6-inch-lift-kit-polaris-ranger-1000-action.jpg"
    ],
    inventoryCount: 8,
    weight: 85.0,
    dimensions: {
      length: 42,
      width: 32,
      height: 18
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 64,
    tags: ["lift kit", "suspension", "ground clearance", "polaris", "ranger"],
    videoUrl: "https://www.youtube.com/watch?v=PsXVZrU_RuU",
    installationTime: "4-6 hours",
    installationDifficulty: "Advanced",
    metaTitle: "SuperATV 6" Lift Kit for Polaris Ranger 1000 XP | Taylor Made Performance",
    metaDescription: "Transform your Polaris Ranger with SuperATV's 6" Lift Kit - fits up to 35" tires, made with American steel, and provides extreme ground clearance for any terrain.",
    dateAdded: new Date("2022-09-12")
  },

  // Side By Side UTV Parts Products (Supplier ID: 2)
  {
    id: 3,
    name: "Method Race Wheels 406 Beadlock 15x7 UTV Wheel Package with BFG KM3 Tires",
    slug: "method-race-wheels-406-beadlock-utv-wheel-package-bfg-km3-tires",
    sku: "SBS-WHEEL-MTD406-32PKG",
    description: "Complete wheel and tire package featuring Method's premium 406 beadlock wheels paired with BFGoodrich Mud-Terrain KM3 tires. This package offers premium off-road performance with the security of beadlock technology to keep your tires mounted in the most extreme conditions.",
    features: [
      "Method 406 15x7 Beadlock Wheels with Matte Black Finish",
      "32x10R15 BFGoodrich KM3 Mud-Terrain Tires",
      "True beadlock design with forged 6061 aluminum ring",
      "A356 aluminum wheel construction with lifetime structural warranty",
      "Mounted, balanced, and shipped ready to install",
      "Includes valve stems, beadlock hardware, and lug nuts"
    ],
    price: 2399.99,
    compareAtPrice: 2599.99,
    costPrice: 1850.00,
    brandId: 7,
    categoryId: 3,
    supplierId: 2,
    fitment: {
      makes: ["Polaris", "Can-Am", "Yamaha", "Kawasaki", "Honda"],
      models: ["RZR", "Maverick", "YXZ1000R", "Teryx", "Talon"],
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://sidebysideutvparts.com/method-406-beadlock-bfg-km3-package.jpg",
      "https://sidebysideutvparts.com/method-406-beadlock-wheel-detail.jpg",
      "https://sidebysideutvparts.com/bfg-km3-tire-tread-closeup.jpg"
    ],
    inventoryCount: 12,
    weight: 180.0,
    dimensions: {
      length: 32,
      width: 32,
      height: 32
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 48,
    tags: ["wheels", "tires", "beadlock", "method", "bfgoodrich", "km3"],
    videoUrl: "https://www.youtube.com/watch?v=JlkX1tFGVaA",
    installationTime: "60-90 minutes",
    installationDifficulty: "Moderate",
    metaTitle: "Method 406 Beadlock Wheels & BFG KM3 Tire Package | Taylor Made Performance",
    metaDescription: "Premium Method 406 Beadlock wheels paired with BFGoodrich KM3 mud terrain tires - the ultimate UTV wheel and tire package for serious off-road enthusiasts.",
    dateAdded: new Date("2022-10-05")
  },

  // Tusk/Rocky Mountain ATV/MC Products (Supplier ID: 3)
  {
    id: 4,
    name: "Tusk UTV Cab Pack Storage Bag for Polaris RZR XP 1000",
    slug: "tusk-utv-cab-pack-storage-bag-polaris-rzr-xp-1000",
    sku: "TSK-CAB-RZR1K-BLK",
    description: "Maximize your storage with the Tusk UTV Cab Pack for Polaris RZR XP 1000. This durable, weather-resistant storage solution installs easily in your RZR's cabin area, providing convenient access to essentials while on the trail.",
    features: [
      "Heavy-duty 600D polyester construction",
      "Multiple compartments for organized storage",
      "Water-resistant design with sealed zippers",
      "No-drill installation with secure straps",
      "UV-resistant material prevents fading",
      "Perfect for storing tools, snacks, and trail essentials"
    ],
    price: 149.99,
    compareAtPrice: 179.99,
    costPrice: 85.00,
    brandId: 3,
    categoryId: 5,
    supplierId: 3,
    fitment: {
      makes: ["Polaris"],
      models: ["RZR XP 1000", "RZR XP 4 1000", "RZR XP Turbo", "RZR XP 4 Turbo"],
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022]
    },
    images: [
      "https://rockymountainatvmc.com/tusk-cab-pack-rzr-1000-main.jpg",
      "https://rockymountainatvmc.com/tusk-cab-pack-interior-view.jpg",
      "https://rockymountainatvmc.com/tusk-cab-pack-installed.jpg"
    ],
    inventoryCount: 32,
    weight: 5.5,
    dimensions: {
      length: 24,
      width: 12,
      height: 10
    },
    isFeatured: false,
    isPopular: true,
    rating: 4.7,
    reviewCount: 89,
    tags: ["storage", "bags", "accessories", "cab", "organization", "polaris", "rzr"],
    videoUrl: "https://www.youtube.com/watch?v=7FbCD_kxnM4",
    installationTime: "15-30 minutes",
    installationDifficulty: "Easy",
    metaTitle: "Tusk UTV Cab Pack Storage Bag for Polaris RZR XP 1000 | Taylor Made Performance",
    metaDescription: "Add convenient, weather-resistant storage to your Polaris RZR with the Tusk UTV Cab Pack - heavy-duty construction with multiple compartments for all your trail essentials.",
    dateAdded: new Date("2022-07-28")
  },

  // Pro Armor Products (Supplier ID: 4)
  {
    id: 5,
    name: "Pro Armor Crawler XG All-Terrain UTV Tires 30x10R14 (Set of 4)",
    slug: "pro-armor-crawler-xg-all-terrain-utv-tires-30x10r14-set",
    sku: "PA-TIRE-CXG-3010-SET4",
    description: "Pro Armor Crawler XG tires deliver exceptional performance across diverse terrain. With an aggressive tread pattern, 8-ply rating, and reinforced sidewalls, these tires provide excellent traction while resisting punctures and cuts during intense off-road adventures.",
    features: [
      "30x10R14 size - perfect for most modern UTVs",
      "8-ply rated for durability in harsh conditions",
      "Unique tread pattern for optimal traction in multiple terrains",
      "Reinforced sidewalls to prevent punctures",
      "Balanced for smooth ride quality",
      "Set of 4 tires - complete your UTV setup"
    ],
    price: 799.99,
    compareAtPrice: 899.99,
    costPrice: 520.00,
    brandId: 4,
    categoryId: 3,
    supplierId: 4,
    fitment: {
      makes: ["Polaris", "Can-Am", "Yamaha", "Kawasaki", "Honda", "Arctic Cat"],
      models: ["RZR", "Maverick", "YXZ1000R", "Teryx", "Talon", "Wildcat"],
      years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://proarmor.com/crawler-xg-tire-angled.jpg",
      "https://proarmor.com/crawler-xg-tire-tread-detail.jpg",
      "https://proarmor.com/crawler-xg-tire-sidewall.jpg"
    ],
    inventoryCount: 24,
    weight: 120.0,
    dimensions: {
      length: 30,
      width: 30,
      height: 10
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 124,
    tags: ["tires", "all-terrain", "wheels", "crawler", "pro armor"],
    videoUrl: "https://www.youtube.com/watch?v=xLD7KGZm5cM",
    installationTime: "45-60 minutes",
    installationDifficulty: "Moderate",
    metaTitle: "Pro Armor Crawler XG All-Terrain UTV Tires 30x10R14 | Taylor Made Performance",
    metaDescription: "Upgrade your UTV with Pro Armor Crawler XG tires - 8-ply rated with reinforced sidewalls and aggressive tread pattern for superior traction in all terrain types.",
    dateAdded: new Date("2022-11-03")
  },

  // DragonFire Racing Products (Supplier ID: 6)
  {
    id: 6,
    name: "DragonFire Racing ReadyForce Door Kit for Can-Am Maverick X3",
    slug: "dragonfire-racing-readyforce-door-kit-can-am-maverick-x3",
    sku: "DF-DOOR-CAM-X3-KIT",
    description: "Enhance the safety and comfort of your Can-Am Maverick X3 with DragonFire's ReadyForce doors. These premium doors feature a durable aluminum frame with high-impact polymer panels that keep debris out while maintaining the open-air feel of your UTV.",
    features: [
      "Lightweight aluminum frame construction",
      "High-impact polymer panels",
      "Slam latch door handles for secure closure",
      "Easy bolt-on installation with included hardware",
      "Includes weather stripping to minimize dust infiltration",
      "Designed specifically for X3 body contours"
    ],
    price: 899.99,
    compareAtPrice: 999.99,
    costPrice: 625.00,
    brandId: 6,
    categoryId: 4,
    supplierId: 6,
    fitment: {
      makes: ["Can-Am"],
      models: ["Maverick X3", "Maverick X3 MAX"],
      years: [2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://dragonfireracing.com/readyforce-doors-x3-installed.jpg",
      "https://dragonfireracing.com/readyforce-doors-x3-detail.jpg",
      "https://dragonfireracing.com/readyforce-doors-x3-handle.jpg"
    ],
    inventoryCount: 14,
    weight: 42.0,
    dimensions: {
      length: 48,
      width: 24,
      height: 8
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.9,
    reviewCount: 78,
    tags: ["doors", "protection", "can-am", "maverick x3", "safety", "dragonfire"],
    videoUrl: "https://www.youtube.com/watch?v=QZd7Lb4Y8x0",
    installationTime: "60-90 minutes",
    installationDifficulty: "Moderate",
    metaTitle: "DragonFire Racing ReadyForce Door Kit for Can-Am Maverick X3 | Taylor Made Performance",
    metaDescription: "Upgrade your Can-Am Maverick X3 with DragonFire Racing's ReadyForce doors - aluminum frame with polymer panels, slam latch handles, and perfect fitment for protection and style.",
    dateAdded: new Date("2023-01-15")
  },

  // SeizMik Products (Supplier ID: 8)
  {
    id: 7,
    name: "Seizmik Vented Windshield for Honda Talon 1000R/1000X",
    slug: "seizmik-vented-windshield-honda-talon-1000",
    sku: "SZM-WS-HON-TAL-VNT",
    description: "Seizmik's vented windshield for Honda Talon delivers the perfect balance of protection and airflow. The adjustable vents allow you to control air circulation while maintaining visibility and protection from debris, making it ideal for varying weather conditions.",
    features: [
      "Hard-coated polycarbonate construction for durability",
      "Adjustable vents for customizable airflow",
      "Scratch-resistant coating for long-lasting clarity",
      "Quick-release clamps for easy installation/removal",
      "Made in the USA with premium materials",
      "Will not yellow or become brittle over time"
    ],
    price: 349.99,
    compareAtPrice: 399.99,
    costPrice: 220.00,
    brandId: 8,
    categoryId: 4,
    supplierId: 8,
    fitment: {
      makes: ["Honda"],
      models: ["Talon 1000R", "Talon 1000X", "Talon 1000X-4"],
      years: [2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://seizmik.com/vented-windshield-talon-installed.jpg",
      "https://seizmik.com/vented-windshield-talon-vent-detail.jpg",
      "https://seizmik.com/vented-windshield-talon-angle-view.jpg"
    ],
    inventoryCount: 19,
    weight: 18.5,
    dimensions: {
      length: 36,
      width: 24,
      height: 4
    },
    isFeatured: false,
    isPopular: true,
    rating: 4.7,
    reviewCount: 52,
    tags: ["windshield", "vented", "honda", "talon", "protection", "visibility"],
    videoUrl: "https://www.youtube.com/watch?v=LdKz8PvRm1c",
    installationTime: "20-30 minutes",
    installationDifficulty: "Easy",
    metaTitle: "Seizmik Vented Windshield for Honda Talon 1000 | Taylor Made Performance",
    metaDescription: "Enhance your Honda Talon with Seizmik's premium vented windshield - scratch-resistant polycarbonate with adjustable vents for perfect airflow control in any conditions.",
    dateAdded: new Date("2023-02-08")
  },

  // SSV Works Products (Supplier ID: 9)
  {
    id: 8,
    name: "SSV Works Complete 5-Speaker Overhead Audio System for Polaris RZR XP",
    slug: "ssv-works-complete-5-speaker-overhead-audio-system-polaris-rzr-xp",
    sku: "SSV-WP-RZO5A",
    description: "Transform your ride with SSV Works' premium overhead sound system for Polaris RZR. This complete package delivers incredible sound quality with weather-resistant components specifically tuned for the open-air UTV environment.",
    features: [
      "Includes 5 marine-grade speakers with optimal positioning",
      "200W amplifier with Bluetooth connectivity",
      "Weatherproof control panel with LED backlight",
      "Direct plug-and-play wiring harness",
      "Fiberglass overhead enclosure with factory-match texture",
      "Integrated dome light and storage compartments"
    ],
    price: 1499.99,
    compareAtPrice: 1699.99,
    costPrice: 1050.00,
    brandId: 9,
    categoryId: 6,
    supplierId: 9,
    fitment: {
      makes: ["Polaris"],
      models: ["RZR XP 1000", "RZR XP 4 1000", "RZR XP Turbo", "RZR XP 4 Turbo"],
      years: [2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://ssvworks.com/rzr-5-speaker-system-installed.jpg",
      "https://ssvworks.com/rzr-audio-system-controller.jpg",
      "https://ssvworks.com/rzr-overhead-system-angle.jpg"
    ],
    inventoryCount: 7,
    weight: 35.0,
    dimensions: {
      length: 42,
      width: 24,
      height: 12
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 34,
    tags: ["audio", "speakers", "sound system", "bluetooth", "polaris", "rzr", "entertainment"],
    videoUrl: "https://www.youtube.com/watch?v=N8j7KKpMQZk",
    installationTime: "2-3 hours",
    installationDifficulty: "Advanced",
    metaTitle: "SSV Works 5-Speaker Overhead Audio System for Polaris RZR | Taylor Made Performance",
    metaDescription: "Premium SSV Works audio system for Polaris RZR with 5 marine-grade speakers, 200W amplifier, and Bluetooth connectivity - designed specifically for off-road performance.",
    dateAdded: new Date("2023-01-22")
  },

  // High Lifter Products (Supplier ID: 10)
  {
    id: 9,
    name: "High Lifter 3-5\" Signature Series Lift Kit for Can-Am Defender HD",
    slug: "high-lifter-signature-series-lift-kit-can-am-defender",
    sku: "HL-LFT-CA-DEF-35",
    description: "High Lifter's Signature Series lift kit gives your Can-Am Defender the additional ground clearance needed for tackling extreme mud and trail obstacles. Engineered specifically for the Defender, this kit maintains handling characteristics while dramatically improving capability.",
    features: [
      "Adjustable from 3\" to 5\" of lift height",
      "Heavy-duty steel brackets and components",
      "Includes extended radius rods and brake lines",
      "Maintains factory drive angles to prevent vibration",
      "Complete with detailed installation instructions",
      "Powder-coated finish for corrosion resistance"
    ],
    price: 899.99,
    compareAtPrice: 999.99,
    costPrice: 610.00,
    brandId: 10,
    categoryId: 1,
    supplierId: 10,
    fitment: {
      makes: ["Can-Am"],
      models: ["Defender HD5", "Defender HD8", "Defender HD10", "Defender MAX"],
      years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://highlifter.com/defender-lift-kit-installed.jpg",
      "https://highlifter.com/defender-lift-kit-components.jpg",
      "https://highlifter.com/defender-lift-kit-clearance.jpg"
    ],
    inventoryCount: 11,
    weight: 68.0,
    dimensions: {
      length: 36,
      width: 24,
      height: 12
    },
    isFeatured: true,
    isPopular: true,
    rating: 4.8,
    reviewCount: 42,
    tags: ["lift kit", "mud", "can-am", "defender", "ground clearance", "suspension"],
    videoUrl: "https://www.youtube.com/watch?v=Kb2UcYFvHFE",
    installationTime: "3-5 hours",
    installationDifficulty: "Advanced",
    metaTitle: "High Lifter 3-5\" Signature Lift Kit for Can-Am Defender | Taylor Made Performance",
    metaDescription: "Give your Can-Am Defender extreme ground clearance with High Lifter's adjustable 3-5\" lift kit - engineered specifically for mud performance with heavy-duty components.",
    dateAdded: new Date("2022-12-08")
  },

  // Moose Racing/Parts Unlimited Products (Supplier ID: 5)
  {
    id: 10,
    name: "Moose Racing 4500lb Synthetic Rope UTV Winch",
    slug: "moose-racing-4500lb-synthetic-rope-utv-winch",
    sku: "MR-WNCH-4500-SYNTH",
    description: "Moose Racing's 4500lb winch combines reliable performance with lightweight synthetic rope for safer recovery operations. With a fully sealed motor and solenoid, this winch delivers consistent pulling power in all weather conditions.",
    features: [
      "4,500 lb. pull capacity with planetary gear system",
      "50' synthetic rope with aluminum hawse fairlead",
      "Fully sealed 1.6hp motor and contactor for waterproof operation",
      "Wireless remote with 50' range included",
      "Includes handlebar-mounted switch for in-cab operation",
      "Compact design fits most UTV winch mounts"
    ],
    price: 499.99,
    compareAtPrice: 599.99,
    costPrice: 350.00,
    brandId: 5,
    categoryId: 7,
    supplierId: 5,
    fitment: {
      makes: ["Polaris", "Can-Am", "Yamaha", "Kawasaki", "Honda", "Arctic Cat", "Kubota"],
      models: ["All Models with Compatible Winch Mount"],
      years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023]
    },
    images: [
      "https://partsunlimited.com/moose-4500-winch-main.jpg",
      "https://partsunlimited.com/moose-winch-remote.jpg",
      "https://partsunlimited.com/moose-winch-installed-rzr.jpg"
    ],
    inventoryCount: 22,
    weight: 28.5,
    dimensions: {
      length: 14,
      width: 9,
      height: 6
    },
    isFeatured: false,
    isPopular: true,
    rating: 4.7,
    reviewCount: 68,
    tags: ["winch", "recovery", "synthetic rope", "offroad", "accessories", "safety"],
    videoUrl: "https://www.youtube.com/watch?v=jPd3EfK9zUM",
    installationTime: "60-90 minutes",
    installationDifficulty: "Moderate",
    metaTitle: "Moose Racing 4500lb Synthetic Rope UTV Winch | Taylor Made Performance",
    metaDescription: "Premium 4500lb Moose Racing winch with synthetic rope and wireless remote - waterproof design for reliable recovery in any conditions for all UTV models.",
    dateAdded: new Date("2022-10-18")
  }
];

// Categories for UTV parts
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  productCount: number;
  parentId: number | null;
}

export const utvCategories: Category[] = [
  {
    id: 1,
    name: "Suspension & Lift Kits",
    slug: "suspension-lift-kits",
    description: "Increase ground clearance and improve your UTV's capability with premium suspension components and lift kits.",
    imageUrl: "https://utvparts-images.com/categories/suspension-lift-kits.jpg",
    isFeatured: true,
    productCount: 84,
    parentId: null
  },
  {
    id: 2,
    name: "Drivetrain & Axles",
    slug: "drivetrain-axles",
    description: "Heavy-duty drivetrain components including axles, differentials, and drive shafts for maximum durability.",
    imageUrl: "https://utvparts-images.com/categories/drivetrain-axles.jpg",
    isFeatured: true,
    productCount: 68,
    parentId: null
  },
  {
    id: 3,
    name: "Wheels & Tires",
    slug: "wheels-tires",
    description: "Upgrade your UTV's performance and style with premium wheels and terrain-specific tires.",
    imageUrl: "https://utvparts-images.com/categories/wheels-tires.jpg",
    isFeatured: true,
    productCount: 112,
    parentId: null
  },
  {
    id: 4,
    name: "Body & Protection",
    slug: "body-protection",
    description: "Protect your machine with skid plates, bumpers, doors, windshields and other protective accessories.",
    imageUrl: "https://utvparts-images.com/categories/body-protection.jpg",
    isFeatured: true,
    productCount: 95,
    parentId: null
  },
  {
    id: 5,
    name: "Storage & Cargo",
    slug: "storage-cargo",
    description: "Maximize your cargo capacity with UTV-specific storage solutions, cargo boxes, and rack systems.",
    imageUrl: "https://utvparts-images.com/categories/storage-cargo.jpg",
    isFeatured: false,
    productCount: 43,
    parentId: null
  },
  {
    id: 6,
    name: "Audio & Electronics",
    slug: "audio-electronics",
    description: "Enhance your ride with sound systems, GPS navigation, communication devices, and lighting upgrades.",
    imageUrl: "https://utvparts-images.com/categories/audio-electronics.jpg",
    isFeatured: true,
    productCount: 57,
    parentId: null
  },
  {
    id: 7,
    name: "Winches & Recovery",
    slug: "winches-recovery",
    description: "Be prepared for any situation with reliable winches, recovery kits, and extraction equipment.",
    imageUrl: "https://utvparts-images.com/categories/winches-recovery.jpg",
    isFeatured: false,
    productCount: 38,
    parentId: null
  },
  {
    id: 8,
    name: "Performance",
    slug: "performance",
    description: "Boost your UTV's power and efficiency with performance upgrades for engine, exhaust, and intake systems.",
    imageUrl: "https://utvparts-images.com/categories/performance.jpg",
    isFeatured: true,
    productCount: 76,
    parentId: null
  },
  {
    id: 9,
    name: "Plows & Implements",
    slug: "plows-implements",
    description: "Transform your UTV into a workhorse with snowplows, spreaders, and other work-saving implements.",
    imageUrl: "https://utvparts-images.com/categories/plows-implements.jpg",
    isFeatured: false,
    productCount: 29,
    parentId: null
  },
  {
    id: 10,
    name: "Maintenance & Chemicals",
    slug: "maintenance-chemicals",
    description: "Keep your UTV running at peak performance with maintenance parts, fluids, and cleaning products.",
    imageUrl: "https://utvparts-images.com/categories/maintenance-chemicals.jpg",
    isFeatured: false,
    productCount: 64,
    parentId: null
  }
];

// Brands for UTV parts
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  isFeatured: boolean;
}

export const utvBrands: Brand[] = [
  {
    id: 1,
    name: "SuperATV",
    slug: "superatv",
    description: "Industry-leading manufacturer of aftermarket UTV parts and accessories, known for innovation and quality.",
    logoUrl: "https://utvparts-images.com/brands/superatv-logo.png",
    websiteUrl: "https://www.superatv.com",
    isFeatured: true
  },
  {
    id: 2,
    name: "Tusk",
    slug: "tusk",
    description: "Premium UTV parts and accessories offering excellent value without compromising on durability or performance.",
    logoUrl: "https://utvparts-images.com/brands/tusk-logo.png",
    websiteUrl: "https://www.rockymountainatvmc.com/tusk",
    isFeatured: true
  },
  {
    id: 3,
    name: "Moose Racing",
    slug: "moose-racing",
    description: "Comprehensive line of high-quality UTV parts, accessories and riding gear for recreational and utility use.",
    logoUrl: "https://utvparts-images.com/brands/moose-racing-logo.png",
    websiteUrl: "https://www.mooseracing.com",
    isFeatured: false
  },
  {
    id: 4,
    name: "Pro Armor",
    slug: "pro-armor",
    description: "Specializing in UTV doors, cages, seats, and protection accessories with a focus on performance and style.",
    logoUrl: "https://utvparts-images.com/brands/pro-armor-logo.png",
    websiteUrl: "https://www.proarmor.com",
    isFeatured: true
  },
  {
    id: 5,
    name: "Parts Unlimited",
    slug: "parts-unlimited",
    description: "One of the largest distributors of aftermarket accessories in the powersports industry.",
    logoUrl: "https://utvparts-images.com/brands/parts-unlimited-logo.png",
    websiteUrl: "https://www.partsunlimited.com",
    isFeatured: false
  },
  {
    id: 6,
    name: "DragonFire Racing",
    slug: "dragonfire-racing",
    description: "Performance-focused UTV parts specializing in racing components, doors, and premium accessories.",
    logoUrl: "https://utvparts-images.com/brands/dragonfire-logo.png",
    websiteUrl: "https://www.dragonfireracing.com",
    isFeatured: true
  },
  {
    id: 7,
    name: "Method Race Wheels",
    slug: "method-race-wheels",
    description: "Premium UTV wheels engineered for racing and extreme off-road performance.",
    logoUrl: "https://utvparts-images.com/brands/method-logo.png",
    websiteUrl: "https://www.methodracewheels.com",
    isFeatured: true
  },
  {
    id: 8,
    name: "Seizmik",
    slug: "seizmik",
    description: "Specializing in UTV cab systems, mirrors, windshields, and hunting accessories.",
    logoUrl: "https://utvparts-images.com/brands/seizmik-logo.png",
    websiteUrl: "https://www.seizmik.com",
    isFeatured: false
  },
  {
    id: 9,
    name: "SSV Works",
    slug: "ssv-works",
    description: "Audio solutions specifically designed for the unique challenges of UTV environments.",
    logoUrl: "https://utvparts-images.com/brands/ssv-works-logo.png",
    websiteUrl: "https://www.ssvworks.com",
    isFeatured: true
  },
  {
    id: 10,
    name: "High Lifter",
    slug: "high-lifter",
    description: "Mud-focused UTV parts and accessories including lift kits, snorkels, and specialized mud components.",
    logoUrl: "https://utvparts-images.com/brands/high-lifter-logo.png",
    websiteUrl: "https://www.highlifter.com",
    isFeatured: true
  }
];

// Helper to get supplier by ID
export function getSupplierById(id: number): Supplier | undefined {
  return utvPartSuppliers.find(supplier => supplier.id === id);
}

// Helper to get product by ID
export function getProductById(id: number): Product | undefined {
  return utvProducts.find(product => product.id === id);
}

// Helper to get category by ID
export function getCategoryById(id: number): Category | undefined {
  return utvCategories.find(category => category.id === id);
}

// Helper to get brand by ID
export function getBrandById(id: number): Brand | undefined {
  return utvBrands.find(brand => brand.id === id);
}

// Helper to get products by category
export function getProductsByCategory(categoryId: number): Product[] {
  return utvProducts.filter(product => product.categoryId === categoryId);
}

// Helper to get products by brand
export function getProductsByBrand(brandId: number): Product[] {
  return utvProducts.filter(product => product.brandId === brandId);
}

// Helper to get products by supplier
export function getProductsBySupplier(supplierId: number): Product[] {
  return utvProducts.filter(product => product.supplierId === supplierId);
}

// Helper to get featured products
export function getFeaturedProducts(): Product[] {
  return utvProducts.filter(product => product.isFeatured);
}

// Helper to get popular products
export function getPopularProducts(): Product[] {
  return utvProducts.filter(product => product.isPopular);
}

// Helper to get products by vehicle fitment
export function getProductsByVehicle(make: string, model: string, year: number): Product[] {
  return utvProducts.filter(product => 
    product.fitment.makes.includes(make) && 
    product.fitment.models.includes(model) && 
    product.fitment.years.includes(year)
  );
}

// Helper to get products sorted by price (asc or desc)
export function getProductsSortedByPrice(ascending: boolean = true): Product[] {
  return [...utvProducts].sort((a, b) => {
    return ascending ? a.price - b.price : b.price - a.price;
  });
}

// Helper to get products sorted by rating
export function getProductsSortedByRating(): Product[] {
  return [...utvProducts].sort((a, b) => b.rating - a.rating);
}

// Helper to get products with the best profit margins
export function getProductsByProfitMargin(minMarginPercentage: number = 30): Product[] {
  return utvProducts.filter(product => {
    const marginPercentage = ((product.price - product.costPrice) / product.price) * 100;
    return marginPercentage >= minMarginPercentage;
  });
}

// Helper to search products by keyword
export function searchProducts(keyword: string): Product[] {
  const lowercaseKeyword = keyword.toLowerCase();
  return utvProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseKeyword) ||
    product.description.toLowerCase().includes(lowercaseKeyword) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseKeyword))
  );
}