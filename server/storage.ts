import { 
  User, InsertUser, users,
  Category, InsertCategory, categories,
  Brand, InsertBrand, brands,
  VehicleModel, InsertVehicleModel, vehicleModels,
  Product, InsertProduct, products,
  Review, InsertReview, reviews,
  Order, InsertOrder, orders,
  OrderItem, InsertOrderItem, orderItems,
  Article, InsertArticle, articles,
  ContactMessage, InsertContactMessage, contactMessages,
  Subscriber, InsertSubscriber, subscribers,
  ChatConversation, InsertChatConversation, chatConversations,
  ChatMessage, InsertChatMessage, chatMessages
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined>;

  // Brands
  getBrands(): Promise<Brand[]>;
  getBrandBySlug(slug: string): Promise<Brand | undefined>;
  getBrandById(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;

  // Vehicle Models
  getVehicleModels(): Promise<VehicleModel[]>;
  getVehicleMakes(): Promise<string[]>;
  getVehicleModelsByMake(make: string): Promise<string[]>;
  getVehicleYearsByMakeAndModel(make: string, model: string): Promise<number[]>;
  createVehicleModel(vehicleModel: InsertVehicleModel): Promise<VehicleModel>;

  // Products
  getProducts(options?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    brandId?: number;
    isFeatured?: boolean;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[]; total: number }>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  updateProductInventory(id: number, quantity: number): Promise<boolean>;

  // Reviews
  getReviewsByProductId(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(orderData: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updatePaymentStatus(id: number, paymentStatus: string, stripePaymentIntentId?: string): Promise<Order | undefined>;

  // Order Items
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Articles
  getArticles(options?: {
    limit?: number;
    offset?: number;
    isPublished?: boolean;
  }): Promise<{ articles: Article[]; total: number }>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;

  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;

  // Newsletter Subscribers
  createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;

  // Chatbot
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByConversationId(conversationId: number): Promise<ChatMessage[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private brands: Map<number, Brand>;
  private vehicleModels: Map<number, VehicleModel>;
  private products: Map<number, Product>;
  private reviews: Map<number, Review>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private articles: Map<number, Article>;
  private contactMessages: Map<number, ContactMessage>;
  private subscribers: Map<number, Subscriber>;
  private chatConversations: Map<number, ChatConversation>;
  private chatMessages: Map<number, ChatMessage>;

  private userId: number = 1;
  private categoryId: number = 1;
  private brandId: number = 1;
  private vehicleModelId: number = 1;
  private productId: number = 1;
  private reviewId: number = 1;
  private orderId: number = 1;
  private orderItemId: number = 1;
  private articleId: number = 1;
  private contactMessageId: number = 1;
  private subscriberId: number = 1;
  private chatConversationId: number = 1;
  private chatMessageId: number = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.brands = new Map();
    this.vehicleModels = new Map();
    this.products = new Map();
    this.reviews = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.articles = new Map();
    this.contactMessages = new Map();
    this.subscribers = new Map();
    this.chatConversations = new Map();
    this.chatMessages = new Map();

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create brands
    const brand1 = this.createBrand({
      name: "TaylorMade Performance",
      slug: "taylormade-performance",
      logoUrl: "https://example.com/logos/taylormade.svg",
      description: "Official brand of premium UTV aftermarket parts"
    });

    const brand2 = this.createBrand({
      name: "Extreme UTV",
      slug: "extreme-utv",
      logoUrl: "https://example.com/logos/extreme-utv.svg",
      description: "Specializing in high-performance UTV components"
    });

    const brand3 = this.createBrand({
      name: "TrailBlazer",
      slug: "trailblazer",
      logoUrl: "https://example.com/logos/trailblazer.svg",
      description: "Off-road tested and proven UTV parts"
    });

    const brand4 = this.createBrand({
      name: "UltraBright",
      slug: "ultrabright",
      logoUrl: "https://example.com/logos/ultrabright.svg",
      description: "Premium lighting solutions for UTVs"
    });

    // Create categories
    const exhaustsCategory = this.createCategory({
      name: "Performance Exhausts",
      slug: "performance-exhausts",
      description: "Boost power and sound with our premium exhaust systems",
      imageUrl: "https://pixabay.com/get/gb1ef5830ec5e95fd76dda0640e14f20ee95144625514439de316bcec3711d0ccaf9869d02d090ca6283d742848443697ac5efa9a95cf740647b01f4ccb6a08da_1280.jpg",
      productCount: 40
    });
    
    const suspensionCategory = this.createCategory({
      name: "Suspension Upgrades",
      slug: "suspension-upgrades",
      description: "Elevate your ride with premium suspension components",
      imageUrl: "https://images.unsplash.com/photo-1533922922960-9fceb9ef4733",
      productCount: 65
    });
    
    const wheelsCategory = this.createCategory({
      name: "Wheels & Tires",
      slug: "wheels-tires",
      description: "Dominate any terrain with our premium wheels and tires",
      imageUrl: "https://pixabay.com/get/gcdda133331084219945560d25413774a73e619ce02556eb7edc11139df980012439a9a014cb2ca91276c13742eda00ce1e4ff46dd7cde824f14a96edbb914e3b_1280.jpg",
      productCount: 95
    });
    
    const engineCategory = this.createCategory({
      name: "Engine Components",
      slug: "engine-components",
      description: "Extract maximum performance from your UTV engine",
      imageUrl: "https://pixabay.com/get/g22bcf1b8f4d36a025ef7e4ad99cac222d880585466cdabfb48d2bc4945df49c8038f20bb983002533e884d88bfaa4deea640543d84499fed625de38a103cc33a_1280.jpg",
      productCount: 78
    });
    
    const lightingCategory = this.createCategory({
      name: "Lighting",
      slug: "lighting",
      description: "Illuminate the path ahead with our high-performance lighting",
      imageUrl: "https://pixabay.com/get/gabf141a0b16285f8089aeb1d052d7b450890ffe44549cb55c9f7bb4601dec0b1cdd61ed2fef6e8fd51fef124ed483dddda9eec217542fbd8c7321b023b5f32cd_1280.jpg",
      productCount: 55
    });
    
    const protectionCategory = this.createCategory({
      name: "Body & Protection",
      slug: "body-protection",
      description: "Shield your UTV with premium protective components",
      imageUrl: "https://images.unsplash.com/photo-1570288685369-f7305163d0e3",
      productCount: 45
    });

    // Create vehicle models
    // Polaris
    this.createVehicleModel({ make: "Polaris", model: "RZR XP 1000", year: 2023, variant: "Standard" });
    this.createVehicleModel({ make: "Polaris", model: "RZR XP 1000", year: 2022, variant: "Standard" });
    this.createVehicleModel({ make: "Polaris", model: "RZR XP 1000", year: 2021, variant: "Standard" });
    this.createVehicleModel({ make: "Polaris", model: "RZR Pro XP", year: 2023, variant: "Ultimate" });
    this.createVehicleModel({ make: "Polaris", model: "RZR Pro XP", year: 2022, variant: "Ultimate" });
    this.createVehicleModel({ make: "Polaris", model: "RZR Turbo S", year: 2023, variant: "Premium" });
    this.createVehicleModel({ make: "Polaris", model: "RZR Turbo S", year: 2022, variant: "Premium" });
    this.createVehicleModel({ make: "Polaris", model: "RZR 900", year: 2023, variant: "Premium" });
    this.createVehicleModel({ make: "Polaris", model: "RZR 570", year: 2023, variant: "Standard" });

    // Can-Am
    this.createVehicleModel({ make: "Can-Am", model: "Maverick X3", year: 2023, variant: "X RS Turbo RR" });
    this.createVehicleModel({ make: "Can-Am", model: "Maverick X3", year: 2022, variant: "X RS Turbo RR" });
    this.createVehicleModel({ make: "Can-Am", model: "Maverick Sport", year: 2023, variant: "X RC" });
    this.createVehicleModel({ make: "Can-Am", model: "Maverick Trail", year: 2023, variant: "DPS" });

    // Honda
    this.createVehicleModel({ make: "Honda", model: "Talon 1000X", year: 2023, variant: "Standard" });
    this.createVehicleModel({ make: "Honda", model: "Talon 1000R", year: 2023, variant: "Standard" });
    this.createVehicleModel({ make: "Honda", model: "Pioneer 1000", year: 2023, variant: "Deluxe" });

    // Kawasaki
    this.createVehicleModel({ make: "Kawasaki", model: "Teryx KRX 1000", year: 2023, variant: "Standard" });
    this.createVehicleModel({ make: "Kawasaki", model: "Teryx4", year: 2023, variant: "LE" });

    // Yamaha
    this.createVehicleModel({ make: "Yamaha", model: "YXZ1000R SS", year: 2023, variant: "SE" });
    this.createVehicleModel({ make: "Yamaha", model: "YXZ1000R", year: 2023, variant: "Standard" });
    this.createVehicleModel({ make: "Yamaha", model: "Wolverine RMAX4 1000", year: 2023, variant: "XT-R" });

    // Create products
    // Exhaust product
    this.createProduct({
      sku: "EX-RZR1000-001",
      name: "PRO Series Exhaust System for RZR XP 1000",
      slug: "pro-series-exhaust-rzr-xp-1000",
      description: "Gain up to 12% more horsepower and torque with our premium exhaust system, designed specifically for the Polaris RZR XP 1000. Crafted from high-grade stainless steel with precision TIG welding for superior durability and performance. Features a deep, aggressive sound that enhances your riding experience without excessive noise.",
      price: "599.99",
      compareAtPrice: "699.99",
      brandId: brand1.id,
      categoryId: exhaustsCategory.id,
      images: [
        "https://pixabay.com/get/g230af71b0e12ff5af59112a6f3b386558fd37a49f0bf717a7ca4f0d9e6743a29ab1f845014505fc07e36e7c1fa47a1fbd5c6d1398fb5687ae1ac3f333f749c90_1280.jpg",
        "https://example.com/images/exhaust2.jpg",
        "https://example.com/images/exhaust3.jpg"
      ],
      inventoryCount: 35,
      isFeatured: true,
      isActive: true,
      specs: {
        material: "304 Stainless Steel",
        finish: "Black Ceramic Coating",
        weight: "18 lbs",
        soundLevel: "95-98 dB",
        installationTime: "45 minutes",
        warranty: "2 year limited"
      },
      rating: "4.5",
      reviewCount: 42,
      tags: ["Best Seller", "Performance", "Exhaust"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2021, 2022, 2023] }
      ],
      metaTitle: "PRO Series Performance Exhaust for Polaris RZR XP 1000",
      metaDescription: "Upgrade your Polaris RZR XP 1000 with our PRO Series Performance Exhaust System. Gain 12% more HP and torque with premium stainless steel construction."
    });

    // Suspension product
    this.createProduct({
      sku: "SUSP-CANAM-001",
      name: "Elite Series Lift Kit for Can-Am Maverick X3",
      slug: "elite-series-lift-kit-canam-maverick-x3",
      description: "3\" lift with heavy-duty components for maximum ground clearance. Transform your Can-Am Maverick X3 with our Elite Series Lift Kit, engineered for extreme performance in the most challenging terrains. Features high-grade aluminum components and precision-crafted hardware for easy installation and superior durability.",
      price: "849.99",
      compareAtPrice: "999.99",
      brandId: brand2.id,
      categoryId: suspensionCategory.id,
      images: [
        "https://pixabay.com/get/gbea8640c53ca0d32178a08b62033ff12a91661bd3d362d288b8c2bfc3fc4370145e559f3b2fe2c5ad9a6002b0bb549b4_1280.jpg",
        "https://example.com/images/suspension2.jpg",
        "https://example.com/images/suspension3.jpg"
      ],
      inventoryCount: 22,
      isFeatured: true,
      isActive: true,
      specs: {
        liftHeight: "3 inches",
        material: "7075-T6 Aluminum",
        components: "Upper & Lower A-Arms, Trailing Arms, Radius Rods",
        hardware: "Grade 8 Hardware Included",
        installationTime: "3-4 hours",
        warranty: "Lifetime"
      },
      rating: "5.0",
      reviewCount: 29,
      tags: ["Hot", "Suspension", "Lift Kit"],
      compatibleVehicles: [
        { make: "Can-Am", model: "Maverick X3", years: [2021, 2022, 2023] }
      ],
      metaTitle: "Elite Series 3\" Lift Kit for Can-Am Maverick X3",
      metaDescription: "Transform your Can-Am Maverick X3 with our Elite Series 3\" Lift Kit. Maximum ground clearance with premium aluminum components and lifetime warranty."
    });

    // Wheels/Tires product
    this.createProduct({
      sku: "TIRE-ALLTR-001",
      name: "All-Terrain X-Treme UTV Tire Set (Set of 4)",
      slug: "all-terrain-x-treme-utv-tire-set",
      description: "Aggressive tread pattern for ultimate traction in any terrain. Designed specifically for UTVs, our All-Terrain X-Treme Tires feature an innovative dual-compound construction that delivers exceptional grip in various conditions while maintaining excellent durability. The reinforced sidewalls provide extra protection against punctures and the optimized tread pattern ensures excellent self-cleaning capabilities.",
      price: "749.99",
      compareAtPrice: null,
      brandId: brand3.id,
      categoryId: wheelsCategory.id,
      images: [
        "https://pixabay.com/get/g21b08df3ce76a3cb21007793bb77dce5add74e66f4314fb7ea5855058d3534f2abb14c6168e2b770aba305803a2e2b377b8a8ed5abe2efd682afe1189c5eb272_1280.jpg",
        "https://example.com/images/tire2.jpg",
        "https://example.com/images/tire3.jpg"
      ],
      inventoryCount: 8,
      isFeatured: true,
      isActive: true,
      specs: {
        size: "30x10-14",
        plyRating: "8-ply",
        treadDepth: "21/32\"",
        weight: "38 lbs per tire",
        maxPSI: "36 PSI",
        warranty: "2 year limited"
      },
      rating: "4.0",
      reviewCount: 18,
      tags: ["Tire", "All-Terrain", "Low Stock"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2020, 2021, 2022, 2023] },
        { make: "Can-Am", model: "Maverick X3", years: [2020, 2021, 2022, 2023] },
        { make: "Yamaha", model: "YXZ1000R", years: [2020, 2021, 2022, 2023] }
      ],
      metaTitle: "All-Terrain X-Treme UTV Tire Set - Ultimate Off-Road Traction",
      metaDescription: "Dominate any terrain with our All-Terrain X-Treme UTV Tire Set. Aggressive tread pattern, reinforced sidewalls, and superior grip across mud, rocks, and trails."
    });

    // Lighting product
    this.createProduct({
      sku: "LIGHT-50LED-001",
      name: "50\" Curved LED Light Bar - 20,000 Lumens",
      slug: "50-inch-curved-led-light-bar",
      description: "Ultra-bright dual-row LED bar with spot and flood combo beam. Our premium 50\" Curved LED Light Bar delivers exceptional illumination for night riding with an optimized beam pattern that maximizes visibility. The curved design perfectly complements your UTV's contours while providing wider peripheral lighting. Features aircraft-grade aluminum housing with IP68 waterproof rating for extreme durability in all weather conditions.",
      price: "299.99",
      compareAtPrice: "399.99",
      brandId: brand4.id,
      categoryId: lightingCategory.id,
      images: [
        "https://images.unsplash.com/photo-1556800572-1b8aeef2c54f",
        "https://example.com/images/lightbar2.jpg",
        "https://example.com/images/lightbar3.jpg"
      ],
      inventoryCount: 42,
      isFeatured: true,
      isActive: true,
      specs: {
        length: "50 inches",
        lumens: "20,000 lm",
        leds: "96 high-intensity CREE LEDs",
        beamPattern: "Combo Spot/Flood",
        waterproofRating: "IP68",
        lifespan: "50,000+ hours",
        warranty: "3 year limited"
      },
      rating: "4.5",
      reviewCount: 35,
      tags: ["Lighting", "LED", "Best Seller"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR Pro XP", years: [2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR Turbo S", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Can-Am", model: "Maverick X3", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Honda", model: "Talon 1000X", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Kawasaki", model: "Teryx KRX 1000", years: [2020, 2021, 2022, 2023] },
        { make: "Yamaha", model: "YXZ1000R", years: [2019, 2020, 2021, 2022, 2023] }
      ],
      metaTitle: "50\" Curved LED Light Bar - 20,000 Lumens | UTV Lighting",
      metaDescription: "Illuminate any trail with our premium 50\" Curved LED Light Bar. 20,000 lumens, combo beam pattern, and IP68 waterproof rating for maximum visibility."
    });

    // Protection product
    this.createProduct({
      sku: "PROT-RZRDOOR-001",
      name: "Aluminum Half Doors for Polaris RZR XP",
      slug: "aluminum-half-doors-polaris-rzr-xp",
      description: "Premium aluminum construction half doors for enhanced protection and style. Our aluminum half doors are precisely engineered to fit your RZR XP perfectly while providing improved protection from debris, mud, and trail obstacles. The lightweight yet sturdy design features high-quality hinges and latches for smooth operation, and the powder-coated finish ensures lasting durability against the elements.",
      price: "549.99",
      compareAtPrice: "649.99",
      brandId: brand1.id,
      categoryId: protectionCategory.id,
      images: [
        "https://images.unsplash.com/photo-1570288685369-f7305163d0e3",
        "https://example.com/images/doors2.jpg",
        "https://example.com/images/doors3.jpg"
      ],
      inventoryCount: 15,
      isFeatured: false,
      isActive: true,
      specs: {
        material: "6061-T6 Aluminum",
        finish: "Textured Black Powder Coat",
        includes: "Left & Right Doors, Hardware Kit",
        windowOption: "Compatible with optional windows",
        installationTime: "1-2 hours",
        warranty: "2 year limited"
      },
      rating: "4.7",
      reviewCount: 24,
      tags: ["Protection", "Doors", "Body"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR XP Turbo", years: [2019, 2020, 2021, 2022] }
      ],
      metaTitle: "Premium Aluminum Half Doors for Polaris RZR XP 1000",
      metaDescription: "Enhance protection and style with our Premium Aluminum Half Doors for Polaris RZR XP. Precision engineered with powder-coated aluminum construction for durability."
    });

    // Add more products
    this.createProduct({
      sku: "COOL-RADZRXP-001",
      name: "High-Performance Radiator for RZR XP",
      slug: "high-performance-radiator-rzr-xp",
      description: "Increase cooling efficiency by up to 35% with our high-performance aluminum radiator designed specifically for Polaris RZR XP models. Featuring precision TIG welding, increased core size, and optimized fin design for maximum cooling in extreme conditions. Perfect for desert racing and high-temperature environments.",
      price: "429.99",
      compareAtPrice: "499.99",
      brandId: brand1.id,
      categoryId: engineCategory.id,
      images: [
        "https://pixabay.com/get/g22bcf1b8f4d36a025ef7e4ad99cac222d880585466cdabfb48d2bc4945df49c8038f20bb983002533e884d88bfaa4deea640543d84499fed625de38a103cc33a_1280.jpg",
        "https://example.com/images/radiator2.jpg",
        "https://example.com/images/radiator3.jpg"
      ],
      inventoryCount: 12,
      isFeatured: false,
      isActive: true,
      specs: {
        material: "Aluminum",
        rows: "2 row core",
        increase: "35% greater cooling capacity",
        fanCompatibility: "Works with stock or upgraded fans",
        installationTime: "2-3 hours",
        warranty: "Lifetime"
      },
      rating: "4.8",
      reviewCount: 17,
      tags: ["Cooling", "Engine", "Performance"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR Pro XP", years: [2020, 2021, 2022, 2023] }
      ],
      metaTitle: "High-Performance Radiator for Polaris RZR XP | 35% Better Cooling",
      metaDescription: "Upgrade your RZR XP cooling system with our high-performance aluminum radiator. 35% better cooling for extreme desert conditions with lifetime warranty."
    });

    this.createProduct({
      sku: "BELT-XPTURBO-001",
      name: "Heavy-Duty CVT Belt for RZR Turbo",
      slug: "heavy-duty-cvt-belt-rzr-turbo",
      description: "Our premium heavy-duty CVT belt is engineered for extreme power and durability in high-performance turbocharged UTVs. Featuring aramid fiber reinforcement and high-temperature construction, this belt outlasts OEM versions by up to 3X while handling more horsepower. Essential upgrade for modified vehicles or aggressive riding styles.",
      price: "159.99",
      compareAtPrice: "189.99",
      brandId: brand1.id,
      categoryId: engineCategory.id,
      images: [
        "https://example.com/images/belt1.jpg",
        "https://example.com/images/belt2.jpg"
      ],
      inventoryCount: 48,
      isFeatured: false,
      isActive: true,
      specs: {
        construction: "Aramid Fiber Reinforced",
        temperatureRating: "Up to 338°F",
        width: "38mm",
        angle: "30°",
        strength: "50% stronger than OEM",
        warranty: "1 year limited"
      },
      rating: "4.9",
      reviewCount: 32,
      tags: ["Drivetrain", "Belt", "Performance"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR Turbo S", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR Pro XP", years: [2020, 2021, 2022, 2023] }
      ],
      metaTitle: "Heavy-Duty CVT Belt for Polaris RZR Turbo | 3X Longer Life",
      metaDescription: "Premium heavy-duty CVT belt for Polaris RZR Turbo models. 3X longer life than OEM with aramid fiber reinforcement for extreme power and durability."
    });

    this.createProduct({
      sku: "CAGE-RZRXP-001",
      name: "Front Intrusion Bar for RZR XP",
      slug: "front-intrusion-bar-rzr-xp",
      description: "Enhance cab protection with our heavy-duty front intrusion bar, designed specifically for Polaris RZR XP models. Constructed from 1.75\" DOM steel tubing with precision bends and gussets at critical stress points for maximum strength. Provides additional frontal protection while maintaining OEM aesthetics and visibility.",
      price: "249.99",
      compareAtPrice: null,
      brandId: brand1.id,
      categoryId: protectionCategory.id,
      images: [
        "https://example.com/images/cage1.jpg",
        "https://example.com/images/cage2.jpg"
      ],
      inventoryCount: 18,
      isFeatured: false,
      isActive: true,
      specs: {
        material: "1.75\" DOM Steel Tubing",
        finish: "Textured Black Powder Coat",
        hardware: "Grade 8 Hardware Included",
        welding: "TIG welded with gussets",
        installationTime: "1-2 hours",
        warranty: "Lifetime"
      },
      rating: "4.7",
      reviewCount: 11,
      tags: ["Protection", "Cage", "Safety"],
      compatibleVehicles: [
        { make: "Polaris", model: "RZR XP 1000", years: [2019, 2020, 2021, 2022, 2023] },
        { make: "Polaris", model: "RZR XP Turbo", years: [2019, 2020, 2021, 2022] }
      ],
      metaTitle: "Front Intrusion Bar for Polaris RZR XP | Added Protection",
      metaDescription: "Enhance cab protection with our heavy-duty front intrusion bar for Polaris RZR XP. DOM steel construction with lifetime warranty for peace of mind."
    });

    // Create blog articles
    this.createArticle({
      title: "Top 5 Performance Upgrades for Your RZR",
      slug: "top-5-performance-upgrades-rzr",
      content: "Looking to boost your UTV's performance? We break down the top 5 modifications that will transform your riding experience.\n\n1. **Performance Exhaust System**\nUpgrading your exhaust is one of the most effective ways to improve power and torque. A quality aftermarket exhaust reduces backpressure and improves flow, resulting in gains of 5-12% in horsepower depending on your model. The sound improvement is an added bonus!\n\n2. **ECU Tuning**\nAfter upgrading your exhaust, an ECU tune is essential to optimize fuel delivery and timing for your modifications. This ensures your engine runs efficiently and maximizes the performance gains from your hardware upgrades.\n\n3. **Clutch Kit Upgrade**\nThe factory clutch is often a bottleneck for modified UTVs. A performance clutch kit improves acceleration, reduces belt slip, and extends belt life—especially important if you've increased your RZR's power output.\n\n4. **Intake System Upgrade**\nPairing a high-flow air intake with your exhaust system creates a complete performance breathing system. This allows your engine to pull in more air, further enhancing power gains from other modifications.\n\n5. **Turbo Upgrade (for Turbo models)**\nIf you own a turbocharged model, upgrading the turbocharger or installing a boost controller can significantly increase power. Just be sure to support this modification with appropriate fueling and clutch upgrades.\n\nRemember, when upgrading your RZR, it's important to take a systematic approach—ensuring that each component works harmoniously with the others for maximum performance and reliability.",
      excerpt: "Looking to boost your UTV's performance? We break down the top 5 modifications that will transform your riding experience.",
      imageUrl: "https://images.unsplash.com/photo-1516149893016-813d9a01d5d3",
      author: "Mike Wilson",
      tags: ["Performance", "RZR", "Upgrades", "Exhaust", "Tuning"],
      isPublished: true,
      publishedAt: new Date("2023-05-15"),
    });

    this.createArticle({
      title: "DIY UTV Maintenance: Tips & Tricks",
      slug: "diy-utv-maintenance-tips-tricks",
      content: "Save money and keep your UTV running smoothly with these essential maintenance tips every owner should know.\n\n**Regular Maintenance Checklist**\n\n- **Oil Changes**: Don't skip this fundamental maintenance task. Fresh oil is the lifeblood of your engine. For most UTVs, change the oil every 25 hours of operation or twice a season, whichever comes first.\n\n- **Air Filter Maintenance**: Dirty air filters restrict airflow and reduce performance. Clean foam filters every 5-10 rides and replace paper filters according to your manufacturer's recommendations.\n\n- **CVT Belt Inspection**: The CVT belt is a critical component. Inspect it regularly for cracks, glazing, or excess wear. A worn belt can leave you stranded miles from home.\n\n- **Greasing Suspension Components**: Use a quality waterproof grease to lubricate all grease fittings. This prevents premature wear and keeps your suspension working properly.\n\n- **Tire Pressure**: Always check your tire pressure before rides. Incorrect pressure affects handling, traction, and can lead to premature tire wear.\n\n**Advanced DIY Maintenance**\n\n- **Valve Adjustment**: Many UTV engines require periodic valve clearance checks. This is an advanced but manageable DIY task that ensures optimal engine performance.\n\n- **CVT Clutch Cleaning**: Cleaning your primary and secondary clutches improves performance and extends belt life. This requires special tools but is worth learning.\n\n- **Cooling System Flush**: Over time, coolant breaks down and collects debris. Flushing your cooling system annually prevents overheating issues.\n\nDIY maintenance not only saves money but also helps you understand your machine better. Always refer to your owner's manual for specific maintenance intervals and procedures for your model.",
      excerpt: "Save money and keep your UTV running smoothly with these essential maintenance tips every owner should know.",
      imageUrl: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc",
      author: "James Taylor",
      tags: ["Maintenance", "DIY", "Repair", "Tips"],
      isPublished: true,
      publishedAt: new Date("2023-04-28"),
    });

    this.createArticle({
      title: "Ultimate UTV Trail Guide: 2023 Edition",
      slug: "ultimate-utv-trail-guide-2023",
      content: "Discover the best trails across the country for your next UTV adventure, with difficulty ratings and must-see stops.\n\n**Western Region Highlights**\n\n1. **Moab, Utah**: The holy grail of UTV destinations featuring iconic trails like Hell's Revenge and Poison Spider. Difficulty varies from moderate to extremely challenging. Don't miss the spectacular views at Chicken Corners Trail.\n\n2. **Imperial Sand Dunes, California**: Experience the thrill of massive sand dunes rising nearly 300 feet. Best visited from October through April to avoid extreme summer temperatures.\n\n3. **Taylor Park, Colorado**: Over 125 miles of interconnected trails with breathtaking mountain scenery. The Ghost Town Tour is a must-do, connecting historic mining settlements.\n\n**Midwest Favorites**\n\n1. **Hatfield-McCoy Trails, West Virginia**: Over 700 miles of mapped trails across nine trail systems. The Rockhouse and Buffalo Mountain systems offer excellent technical riding.\n\n2. **Silver Lake Sand Dunes, Michigan**: 450 acres of dunes offering a unique combination of sand, forests, and lakeside riding.\n\n3. **Hidden Falls Adventure Park, Texas**: 240 miles of trails ranging from beginner-friendly to extremely challenging rock crawling sections.\n\n**Southeast Gems**\n\n1. **Brimstone Recreation, Tennessee**: 300+ miles of trails spanning 20,000 acres in the Appalachian Mountains. The Annual White Knuckle Event is a must-experience gathering.\n\n2. **Windrock Park, Tennessee**: One of the largest privately-owned riding areas with 73,000 acres and trails for all skill levels. The coal mining history adds interesting elements to many trails.\n\n**Trail Preparation Tips**\n\n- Always check trail status before departing as conditions change frequently\n- Pack emergency supplies including extra fuel, basic tools, and communication devices\n- Observe all trail etiquette and leave no trace principles\n\nRemember to obtain the necessary permits for each riding area and respect all trail closures and restrictions. Happy trailing!",
      excerpt: "Discover the best trails across the country for your next UTV adventure, with difficulty ratings and must-see stops.",
      imageUrl: "https://pixabay.com/get/gbb2d7177ffa9a5ecbbb8568588ae6857b9cface69b6d4460f7aad7fa5669b5d14b2581a2ededeee891442e0d334d1ba6cd733c5694b85e33e3feb1da3c0c92ea_1280.jpg",
      author: "Sarah Johnson",
      tags: ["Trails", "Adventure", "Travel", "Riding Destinations"],
      isPublished: true,
      publishedAt: new Date("2023-04-10"),
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { id, ...user, isAdmin: false };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug
    );
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { id, ...category };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Brands
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrandBySlug(slug: string): Promise<Brand | undefined> {
    return Array.from(this.brands.values()).find(
      (brand) => brand.slug === slug
    );
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(brand: InsertBrand): Promise<Brand> {
    const id = this.brandId++;
    const newBrand: Brand = { id, ...brand };
    this.brands.set(id, newBrand);
    return newBrand;
  }

  // Vehicle Models
  async getVehicleModels(): Promise<VehicleModel[]> {
    return Array.from(this.vehicleModels.values());
  }

  async getVehicleMakes(): Promise<string[]> {
    const makes = new Set<string>();
    for (const model of this.vehicleModels.values()) {
      makes.add(model.make);
    }
    return Array.from(makes);
  }

  async getVehicleModelsByMake(make: string): Promise<string[]> {
    const models = new Set<string>();
    for (const vehicleModel of this.vehicleModels.values()) {
      if (vehicleModel.make === make) {
        models.add(vehicleModel.model);
      }
    }
    return Array.from(models);
  }

  async getVehicleYearsByMakeAndModel(make: string, model: string): Promise<number[]> {
    const years = new Set<number>();
    for (const vehicleModel of this.vehicleModels.values()) {
      if (vehicleModel.make === make && vehicleModel.model === model) {
        years.add(vehicleModel.year);
      }
    }
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }

  async createVehicleModel(vehicleModel: InsertVehicleModel): Promise<VehicleModel> {
    const id = this.vehicleModelId++;
    const newVehicleModel: VehicleModel = { id, ...vehicleModel };
    this.vehicleModels.set(id, newVehicleModel);
    return newVehicleModel;
  }

  // Products
  async getProducts(options: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    brandId?: number;
    isFeatured?: boolean;
    searchTerm?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ products: Product[]; total: number }> {
    let filtered = Array.from(this.products.values());

    // Apply filters
    if (options.categoryId !== undefined) {
      filtered = filtered.filter(product => product.categoryId === options.categoryId);
    }

    if (options.brandId !== undefined) {
      filtered = filtered.filter(product => product.brandId === options.brandId);
    }

    if (options.isFeatured !== undefined) {
      filtered = filtered.filter(product => product.isFeatured === options.isFeatured);
    }

    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(term) || 
        product.description.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (options.sortBy) {
      filtered.sort((a: any, b: any) => {
        if (a[options.sortBy!] < b[options.sortBy!]) {
          return options.sortOrder === 'asc' ? -1 : 1;
        }
        if (a[options.sortBy!] > b[options.sortBy!]) {
          return options.sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    const total = filtered.length;
    if (options.limit !== undefined && options.offset !== undefined) {
      filtered = filtered.slice(options.offset, options.offset + options.limit);
    }

    return { products: filtered, total };
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug
    );
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { 
      id, 
      ...product,
      rating: product.rating || "0",
      reviewCount: 0,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductInventory(id: number, quantity: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;

    const newInventory = Math.max(0, product.inventoryCount - quantity);
    product.inventoryCount = newInventory;
    this.products.set(id, product);
    return true;
  }

  // Reviews
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.productId === productId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = { 
      id, 
      ...review,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = this.products.get(review.productId);
    if (product) {
      const allReviews = await this.getReviewsByProductId(review.productId);
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;
      
      product.rating = averageRating.toFixed(1);
      product.reviewCount = allReviews.length;
      this.products.set(product.id, product);
    }
    
    return newReview;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber
    );
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${id}`;
    
    const newOrder: Order = { 
      id, 
      orderNumber,
      status: "pending",
      paymentStatus: "pending",
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    order.status = status;
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  async updatePaymentStatus(id: number, paymentStatus: string, stripePaymentIntentId?: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    order.paymentStatus = paymentStatus;
    if (stripePaymentIntentId) {
      order.stripePaymentIntentId = stripePaymentIntentId;
    }
    order.updatedAt = new Date();
    this.orders.set(id, order);
    return order;
  }

  // Order Items
  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { id, ...orderItem };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Articles
  async getArticles(options: {
    limit?: number;
    offset?: number;
    isPublished?: boolean;
  } = {}): Promise<{ articles: Article[]; total: number }> {
    let filtered = Array.from(this.articles.values());

    // Apply filters
    if (options.isPublished !== undefined) {
      filtered = filtered.filter(article => article.isPublished === options.isPublished);
    }

    // Sort by published date (newest first)
    filtered.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const total = filtered.length;
    if (options.limit !== undefined && options.offset !== undefined) {
      filtered = filtered.slice(options.offset, options.offset + options.limit);
    }

    return { articles: filtered, total };
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find(
      (article) => article.slug === slug
    );
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.articleId++;
    const newArticle: Article = { 
      id, 
      ...article,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.articles.set(id, newArticle);
    return newArticle;
  }

  // Contact Messages
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageId++;
    const newMessage: ContactMessage = { 
      id, 
      ...message,
      isRead: false,
      createdAt: new Date()
    };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  // Newsletter Subscribers
  async createSubscriber(subscriber: InsertSubscriber): Promise<Subscriber> {
    const existing = await this.getSubscriberByEmail(subscriber.email);
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.subscribedAt = new Date();
        this.subscribers.set(existing.id, existing);
      }
      return existing;
    }

    const id = this.subscriberId++;
    const newSubscriber: Subscriber = { 
      id, 
      ...subscriber,
      isActive: true,
      subscribedAt: new Date()
    };
    this.subscribers.set(id, newSubscriber);
    return newSubscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return Array.from(this.subscribers.values()).find(
      (subscriber) => subscriber.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Chatbot
  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const id = this.chatConversationId++;
    const newConversation: ChatConversation = { 
      id, 
      ...conversation,
      createdAt: new Date()
    };
    this.chatConversations.set(id, newConversation);
    return newConversation;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.chatMessageId++;
    const newMessage: ChatMessage = { 
      id, 
      ...message,
      createdAt: new Date()
    };
    this.chatMessages.set(id, newMessage);
    return newMessage;
  }

  async getChatMessagesByConversationId(conversationId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = new MemStorage();
