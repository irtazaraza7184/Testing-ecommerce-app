import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const HERO_BANNER_IMAGE = '/src/assets/images/hero_modern_lifestyle_1793816057132.jpg';
export const HEADPHONES_IMAGE = '/src/assets/images/product_studio_headphones_1793816059094.jpg';
export const CHAIR_IMAGE = '/src/assets/images/product_lounge_chair_1793816059221.jpg';
export const WATCH_IMAGE = '/src/assets/images/product_titanium_watch_1793816059251.jpg';

export interface DatabaseSchema {
  products: any[];
  categories: any[];
  orders: any[];
  customers: any[];
  reviews: any[];
  coupons: any[];
  inventoryLogs: any[];
  settings: Record<string, any>;
}

export const SEED_DATA: DatabaseSchema = {
  settings: {
    storeName: 'AURA — Modern Retail & Design',
    storeEmail: 'concierge@aura-retail.com',
    currency: 'USD ($)',
    freeShippingThreshold: 150,
    expressShippingFee: 18,
    taxRate: 7.5,
    enableCards: true,
    enableCod: true,
    enableBank: true,
  },
  categories: [
    {
      id: 'cat-audio',
      name: 'Acoustics & Studio',
      slug: 'audio',
      description: 'Reference-grade wireless transducers, precision amplifiers, and studio-fidelity monitors.',
      image: HEADPHONES_IMAGE,
      itemCount: 8,
      isActive: true,
    },
    {
      id: 'cat-furniture',
      name: 'Architectural Furniture',
      slug: 'furniture',
      description: 'Solid European hardwoods, organic linen textiles, and sculptural Scandinavian lounge pieces.',
      image: CHAIR_IMAGE,
      itemCount: 12,
      isActive: true,
    },
    {
      id: 'cat-horology',
      name: 'Precision Horology',
      slug: 'horology',
      description: 'Surgical-grade grade 5 titanium cases, automatic chronographs, and sapphire crystal timepieces.',
      image: WATCH_IMAGE,
      itemCount: 6,
      isActive: true,
    },
    {
      id: 'cat-lighting',
      name: 'Ambient Lighting',
      slug: 'lighting',
      description: 'Brushed brass floor lanterns, diffused travertine table lights, and architectural pendants.',
      image: HERO_BANNER_IMAGE,
      itemCount: 9,
      isActive: true,
    },
    {
      id: 'cat-apparel',
      name: 'Technical Apparel',
      slug: 'apparel',
      description: 'Waterproof Japanese membrane shells, heavyweight supima cottons, and ergonomic tailoring.',
      image: HEADPHONES_IMAGE,
      itemCount: 14,
      isActive: true,
    },
    {
      id: 'cat-apothecary',
      name: 'Botanical Apothecary',
      slug: 'apothecary',
      description: 'Cold-pressed bioactive botanicals, cedarwood extracts, and amber glass essentials.',
      image: WATCH_IMAGE,
      itemCount: 7,
      isActive: true,
    },
  ],
  products: [
    {
      id: 'prod-01',
      name: 'Sonus Pure Studio ANC Headphones',
      slug: 'sonus-pure-studio-anc-headphones',
      brand: 'Sonus Acoustics',
      category: 'Acoustics & Studio',
      categoryId: 'cat-audio',
      description: 'Engineered for audio purists and sound design professionals. Features custom 45mm beryllium drivers, active noise cancellation with zero harmonic distortion, and tactile machined aluminum control dials.',
      shortDescription: 'Custom 45mm beryllium drivers with lossless Bluetooth 5.4 and ultra-low THD.',
      price: 349,
      originalPrice: 399,
      discountPercentage: 12,
      rating: 4.9,
      reviewCount: 128,
      stock: 24,
      sku: 'SNS-HPH-900',
      images: [HEADPHONES_IMAGE, CHAIR_IMAGE, WATCH_IMAGE],
      colors: [
        { name: 'Matte Obsidian', hex: '#18181b' },
        { name: 'Raw Travertine', hex: '#d4c7b8' },
        { name: 'Silver Anodized', hex: '#94a3b8' },
      ],
      specifications: {
        'Transducer Type': '45mm Custom Beryllium Dynamic',
        'Frequency Response': '10Hz – 42,000Hz',
        'Battery Runtime': '48 hours (ANC on)',
        'Connectivity': 'Bluetooth 5.4, aptX Lossless, 3.5mm Analog, USB-C DAC',
        'Weight': '285g',
        'Warranty': '3-Year Manufacturer Guarantee',
      },
      isFeatured: true,
      isNewArrival: false,
      isTrending: true,
      inStock: true,
      createdAt: '2026-09-12',
    },
    {
      id: 'prod-02',
      name: 'Nordic Sculptural Oak Lounge Chair',
      slug: 'nordic-sculptural-oak-lounge-chair',
      brand: 'AURA Atelier',
      category: 'Architectural Furniture',
      categoryId: 'cat-furniture',
      description: 'Handcrafted from FSC-certified solid European white oak with traditional mortise-and-tenon joinery. Low-slung reclined stance with Belgian linen upholstery.',
      shortDescription: 'Solid white oak joinery with unbleached Belgian linen and down cushioning.',
      price: 890,
      originalPrice: 1050,
      discountPercentage: 15,
      rating: 4.8,
      reviewCount: 42,
      stock: 7,
      sku: 'AUR-CHR-204',
      images: [CHAIR_IMAGE, HERO_BANNER_IMAGE, HEADPHONES_IMAGE],
      colors: [
        { name: 'Natural White Oak', hex: '#c8a882' },
        { name: 'Smoked Charcoal Oak', hex: '#262626' },
      ],
      sizes: ['Standard Lounge', 'Grand Lounge (+10%)'],
      specifications: {
        'Frame Material': '100% Solid European White Oak (FSC Certified)',
        'Upholstery': 'Belgian Washed Linen (520 gsm)',
        'Fill': 'High-resilience foam core wrapped in duck down',
        'Dimensions': 'W: 78cm × D: 84cm × H: 74cm',
        'Assembly': 'White glove delivery — fully assembled',
      },
      isFeatured: true,
      isNewArrival: true,
      isTrending: true,
      inStock: true,
      createdAt: '2026-10-01',
    },
    {
      id: 'prod-03',
      name: 'Kallisto Titanium Chronograph 41mm',
      slug: 'kallisto-titanium-chronograph-41mm',
      brand: 'Kallisto Horology',
      category: 'Precision Horology',
      categoryId: 'cat-horology',
      description: 'Machined from a solid monobloc of Grade 5 titanium. Features dual column-wheel automatic mechanical chronograph movement and sapphire crystal.',
      shortDescription: 'Grade 5 aerospace titanium with dual column-wheel mechanical movement.',
      price: 1450,
      originalPrice: 1650,
      discountPercentage: 12,
      rating: 5.0,
      reviewCount: 38,
      stock: 5,
      sku: 'KAL-WTC-410',
      images: [WATCH_IMAGE, HEADPHONES_IMAGE, CHAIR_IMAGE],
      colors: [
        { name: 'Deep Marine Blue', hex: '#1e293b' },
        { name: 'Slate Anthracite', hex: '#334155' },
      ],
      sizes: ['41mm Case', '38mm Case'],
      specifications: {
        'Case Material': 'Grade 5 Aerospace Titanium',
        'Crystal': 'Domed Sapphire with Double Anti-Reflective Coating',
        'Movement': 'Calibre KH-2804 Automatic Chronograph',
        'Power Reserve': '68 Hours',
        'Water Resistance': '100 Meters / 10 ATM',
      },
      isFeatured: true,
      isNewArrival: false,
      isTrending: true,
      inStock: true,
      createdAt: '2026-08-19',
    },
    {
      id: 'prod-04',
      name: 'Travertine Sculptural Table Lantern',
      slug: 'travertine-sculptural-table-lantern',
      brand: 'AURA Atelier',
      category: 'Ambient Lighting',
      categoryId: 'cat-lighting',
      description: 'Monolithic raw Italian travertine base paired with hand-blown frosted opaline glass globe. Continuous capacitive touch dimming.',
      shortDescription: 'Solid Italian travertine and blown frosted glass with capacitive dimming.',
      price: 245,
      originalPrice: 280,
      discountPercentage: 12,
      rating: 4.7,
      reviewCount: 56,
      stock: 19,
      sku: 'AUR-LGT-055',
      images: [HERO_BANNER_IMAGE, CHAIR_IMAGE],
      specifications: {
        'Base Material': 'Honed Roman Travertine Stone',
        'Light Source': 'Warm LED 6W (2400K warm glow, CRI > 95)',
        'Dimming': '3-stage touch sensor',
      },
      isFeatured: true,
      isNewArrival: true,
      isTrending: false,
      inStock: true,
      createdAt: '2026-10-15',
    },
    {
      id: 'prod-05',
      name: 'Merino Thermal Field Parka',
      slug: 'merino-thermal-field-parka',
      brand: 'Kinetic Technical',
      category: 'Technical Apparel',
      categoryId: 'cat-apparel',
      description: 'Constructed with a 3-layer waterproof-breathable Japanese membrane backed with bonded 100% fine New Zealand merino wool interior.',
      shortDescription: '3-Layer waterproof technical shell backed with bonded New Zealand merino.',
      price: 460,
      originalPrice: 520,
      discountPercentage: 11,
      rating: 4.8,
      reviewCount: 67,
      stock: 14,
      sku: 'KIN-APP-812',
      images: [HEADPHONES_IMAGE, WATCH_IMAGE],
      specifications: {
        'Shell': '3-Layer Toray Dermizax Membrane',
        'Lining': 'Bonded 240gsm ZQ-Certified Merino Wool',
        'Hardware': 'YKK Aquaguard Matte Waterproof Zippers',
      },
      isFeatured: false,
      isNewArrival: true,
      isTrending: true,
      inStock: true,
      createdAt: '2026-10-22',
    },
  ],
  orders: [
    {
      id: 'ord-1042',
      orderNumber: 'AUR-2026-1042',
      userId: 'usr-customer-1',
      customerName: 'Eleanor Vance',
      customerEmail: 'eleanor.vance@example.com',
      customerPhone: '+1 (555) 392-8821',
      items: [
        {
          productId: 'prod-01',
          name: 'Sonus Pure Studio ANC Headphones',
          image: HEADPHONES_IMAGE,
          price: 349,
          quantity: 1,
          selectedColor: 'Matte Obsidian',
        },
        {
          productId: 'prod-04',
          name: 'Travertine Sculptural Table Lantern',
          image: HERO_BANNER_IMAGE,
          price: 245,
          quantity: 1,
          selectedColor: 'Beige Roman Travertine',
        },
      ],
      subtotal: 594,
      discountAmount: 50,
      shippingFee: 0,
      taxAmount: 43.52,
      totalAmount: 587.52,
      couponCode: 'AURAWELCOME',
      shippingAddress: {
        id: 'addr-01',
        fullName: 'Eleanor Vance',
        phone: '+1 (555) 392-8821',
        street: '742 Evergreen Terrace',
        apartment: 'Apt 4B',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94107',
        country: 'United States',
      },
      shippingMethod: 'standard',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'shipped',
      statusHistory: [
        { status: 'placed', timestamp: '2026-11-02 09:14', note: 'Order verified and payment authorized.' },
        { status: 'processing', timestamp: '2026-11-02 11:30', note: 'Allocated from West Coast fulfillment hub.' },
        { status: 'packed', timestamp: '2026-11-03 08:20', note: 'Sealed in presentation carton.' },
        { status: 'shipped', timestamp: '2026-11-03 14:45', note: 'Dispatched via FedEx Priority (FX-99281726).' },
      ],
      trackingNumber: 'FX-99281726',
      estimatedDelivery: 'November 6, 2026',
      createdAt: '2026-11-02',
    },
    {
      id: 'ord-1041',
      orderNumber: 'AUR-2026-1041',
      userId: 'usr-customer-2',
      customerName: 'Marcus Sterling',
      customerEmail: 'marcus.s@luxuryhorology.org',
      customerPhone: '+1 (555) 819-2041',
      items: [
        {
          productId: 'prod-03',
          name: 'Kallisto Titanium Chronograph 41mm',
          image: WATCH_IMAGE,
          price: 1450,
          quantity: 1,
          selectedColor: 'Deep Marine Blue',
        },
      ],
      subtotal: 1450,
      discountAmount: 0,
      shippingFee: 0,
      taxAmount: 116.0,
      totalAmount: 1566.0,
      shippingAddress: {
        id: 'addr-ms',
        fullName: 'Marcus Sterling',
        phone: '+1 (555) 819-2041',
        street: '430 Park Avenue',
        apartment: 'Penthouse B',
        city: 'New York',
        state: 'NY',
        postalCode: '10022',
        country: 'United States',
      },
      shippingMethod: 'express',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'delivered',
      statusHistory: [
        { status: 'placed', timestamp: '2026-10-25 10:00', note: 'Order placed.' },
        { status: 'delivered', timestamp: '2026-10-27 13:40', note: 'Signed by M. Sterling.' },
      ],
      trackingNumber: 'AR-77182903',
      estimatedDelivery: 'Delivered Oct 27, 2026',
      createdAt: '2026-10-25',
    },
  ],
  customers: [
    {
      id: 'usr-customer-1',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 392-8821',
      addresses: [
        {
          id: 'addr-01',
          isDefault: true,
          fullName: 'Eleanor Vance',
          phone: '+1 (555) 392-8821',
          street: '742 Evergreen Terrace',
          apartment: 'Apt 4B',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'United States',
        },
      ],
      registeredDate: '2026-03-14',
      totalOrders: 6,
      totalSpent: 3420,
      status: 'active',
    },
    {
      id: 'usr-customer-2',
      name: 'Marcus Sterling',
      email: 'marcus.s@luxuryhorology.org',
      phone: '+1 (555) 819-2041',
      addresses: [],
      registeredDate: '2026-05-20',
      totalOrders: 3,
      totalSpent: 4890,
      status: 'active',
    },
  ],
  reviews: [
    {
      id: 'rev-01',
      productId: 'prod-01',
      productName: 'Sonus Pure Studio ANC Headphones',
      customerName: 'David K., Audio Engineer',
      customerEmail: 'david.k@soundrecord.com',
      rating: 5,
      title: 'Absolute reference-grade neutrality',
      comment: 'Beryllium transient speed is unmatched at this price point. Zero ear fatigue after 7-hour mixing sessions.',
      verifiedPurchase: true,
      date: '2026-10-18',
      status: 'approved',
    },
    {
      id: 'rev-02',
      productId: 'prod-02',
      productName: 'Nordic Sculptural Oak Lounge Chair',
      customerName: 'Clara Lindqvist, Architect',
      customerEmail: 'clara@lindqvist.se',
      rating: 5,
      title: 'Museum-quality joinery',
      comment: 'The grain matching on European white oak legs is breathtaking. Perfectly proportional for modern open living.',
      verifiedPurchase: true,
      date: '2026-10-30',
      status: 'approved',
    },
  ],
  coupons: [
    {
      id: 'coup-01',
      code: 'AURAWELCOME',
      discountPercentage: 15,
      minPurchase: 100,
      expiryDate: '2027-12-31',
      usageLimit: 500,
      timesUsed: 142,
      isActive: true,
    },
    {
      id: 'coup-02',
      code: 'ARCHITECT100',
      fixedAmount: 100,
      minPurchase: 600,
      expiryDate: '2027-06-30',
      usageLimit: 100,
      timesUsed: 29,
      isActive: true,
    },
  ],
  inventoryLogs: [
    {
      id: 'inv-01',
      productId: 'prod-01',
      productName: 'Sonus Pure Studio ANC Headphones',
      changeAmount: 25,
      newStock: 24,
      reason: 'Warehouse consignment intake',
      date: '2026-10-15 14:00',
    },
  ],
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.readFromDisk();
  }

  private readFromDisk(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      this.writeToDisk(SEED_DATA);
      return JSON.parse(JSON.stringify(SEED_DATA));
    }
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch {
      this.writeToDisk(SEED_DATA);
      return JSON.parse(JSON.stringify(SEED_DATA));
    }
  }

  private writeToDisk(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]): void {
    this.data[key] = value;
    this.writeToDisk(this.data);
  }

  public reset(): void {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.writeToDisk(this.data);
  }
}

export const db = new Database();
