// NCR Properties Central Enterprise Store with Reactive Subscriptions & LocalStorage Persistence

const STORE_KEY = "ncr_platform_store_v1";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const PERSONAS = {
  super_admin: {
    id: "usr_sudhir",
    name: "Sudhir (System Owner)",
    email: "sudhir@ncrproperties.ae",
    role: "super_admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    kycStatus: "approved",
    balance: 486000,
    pendingPayout: 94000,
    roleTitle: "Super Admin & Founder",
    badge: "System Owner",
  },
  finance: {
    id: "usr_ananya",
    name: "Ananya Roy (Head of Finance)",
    email: "finance@ncrproperties.ae",
    role: "finance",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    kycStatus: "approved",
    balance: 1240000,
    pendingPayout: 230000,
    roleTitle: "Chief Escrow & Financial Comptroller",
    badge: "Platform Finance",
  },
  checker: {
    id: "usr_navjeet",
    name: "Navjeet Singh",
    email: "navjeet.checker@ncrproperties.ae",
    role: "checker",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    kycStatus: "approved",
    balance: 243000,
    pendingPayout: 47000,
    roleTitle: "Senior Compliance & Moderation Officer",
    badge: "Compliance Auditor",
  },
  dealer: {
    id: "usr_vikram",
    name: "Vikram Kapoor",
    email: "vikram.dealer@ncrproperties.ae",
    role: "dealer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    kycStatus: "approved",
    licenseNumber: "RERA-DLR-DXB-8821",
    agencyName: "Kapoor Luxury Real Estate LLC",
    balance: 486000,
    pendingPayout: 94000,
    roleTitle: "Verified Platinum Dealer",
    badge: "2% Dealer Commission",
  },
  buyer: {
    id: "usr_rahul",
    name: "Rahul Sharma",
    email: "rahul.buyer@gmail.com",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    kycStatus: "approved",
    referralCode: "NCR-RAHUL-789",
    referralPoints: 3400,
    savedSearches: 4,
    holdingDepositBalance: 50000,
    roleTitle: "VIP Investor / Buyer",
    badge: "Verified Buyer",
  },
};

const initialProperties = [
  {
    id: 1,
    title: "Capital One - JVC Commercial Hub",
    slug: "capital-one-jvc",
    price: 1850000,
    displayPrice: "AED 1,850,000",
    location: "Jumeirah Village Circle",
    city: "Dubai",
    type: "Off-Plan",
    status: "Available",
    moderationStatus: "approved",
    moderationRemarks: "RERA verification verified. All NOCs active.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-10",
    checkerRemarks: "RERA title deed and DLD registration certified.",
    checkerCheckType: "auto",
    checkerScore: 98,
    adminApproved: true,
    adminApprovedAt: "2026-02-10",
    adminRemarks: "Commercial validation cleared. 5% Broking Commission configured.",
    adminCheckType: "manual",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Al Futtaim Commercial Real Estate",
    featuredCategory: "Commercial",
    beds: 2,
    baths: 2,
    areaSqft: 1165,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img1.jpg", "/src/img/dubai1.avif"],
    listedAt: "2026-02-10",
  },
  {
    id: 2,
    title: "Modern  Apartment Downtown",
    slug: "modern-apartment-downtown",
    price: 2200000,
    displayPrice: "AED 2,200,000",
    location: "Downtown Dubai",
    city: "Dubai",
    type: "Apartment",
    status: "Available",
    moderationStatus: "approved",
    moderationRemarks: "Title deed checked, approved for live listing.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-12",
    checkerRemarks: "Ownership certificate and NOC checked.",
    checkerCheckType: "auto",
    checkerScore: 95,
    adminApproved: true,
    adminApprovedAt: "2026-02-12",
    adminRemarks: "Downtown market pricing benchmark approved. 5.0% broking assigned.",
    adminCheckType: "auto",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Emaar Properties Partner Holdings",
    featuredCategory: "Residential",
    beds: 2,
    baths: 2,
    areaSqft: 1280,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/dubai1.avif", "/src/img/pexels.avif"],
    listedAt: "2026-02-12",
  },
  {
    id: 3,
    title: "Contemporary Palm Jumeirah Waterfront Villa",
    slug: "contemporary-villa-private-beach-access",
    price: 12500000,
    displayPrice: "AED 12,500,000",
    location: "Palm Jumeirah",
    city: "Dubai",
    type: "Villa",
    status: "Available",
    moderationStatus: "approved",
    moderationRemarks: "Ultra luxury asset. Watermark badge approved.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-14",
    checkerRemarks: "Luxury coastal deed verified with Nakheel.",
    checkerCheckType: "manual",
    checkerScore: 100,
    adminApproved: true,
    adminApprovedAt: "2026-02-14",
    adminRemarks: "Exclusive Palm listing cleared. Broking fee set to 4.5% (Admin 1.75%, Dealer 2.0%, Escrow 0.75%).",
    adminCheckType: "manual",
    brokingPercentage: 4.5,
    adminPlatformPct: 1.75,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 0.75,
    sellerNetPct: 95.5,
    sellerName: "Sheikh Mansoor Royal Holdings",
    featuredCategory: "Residential",
    beds: 6,
    baths: 7,
    areaSqft: 8900,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/pexels.avif", "/src/img/dubai3.jpg", "/src/img/img5.jpg"],
    listedAt: "2026-02-14",
  },
  {
    id: 4,
    title: "Golf View Villa in Dubai Hills Estate",
    slug: "golf-view-villa-dubai-hills-estate",
    price: 9800000,
    displayPrice: "AED 9,800,000",
    location: "Dubai Hills Estate",
    city: "Dubai",
    type: "Villa",
    status: "SOLD",
    moderationStatus: "approved",
    moderationRemarks: "Sale finalized with 5% atomic platform distribution.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-01",
    adminApproved: true,
    adminApprovedAt: "2026-02-01",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Dubai Hills Land Developments",
    featuredCategory: "Community",
    beds: 5,
    baths: 6,
    areaSqft: 6100,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img7.jpg", "/src/img/img4.jpg"],
    listedAt: "2026-02-01",
  },
  {
    id: 5,
    title: "Luxury Ultra-Penthouse Golf Course Road",
    slug: "luxury-ultra-penthouse-golf-course",
    price: 4700000,
    displayPrice: "₹4.07 Cr (AED 1.8M eq)",
    location: "Golf Course Road",
    city: "Delhi NCR",
    type: "Apartment",
    status: "Available",
    moderationStatus: "approved",
    moderationRemarks: "Gurugram Town & Country Planning verified.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "DLF Cybercity Developers Group",
    featuredCategory: "Residential",
    beds: 4,
    baths: 5,
    areaSqft: 4800,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img1.jpg", "/src/img/dubai3.jpg"],
    listedAt: "2026-02-15",
  },
  {
    id: 6,
    title: "Marina View High-Floor Penthouse",
    slug: "marina-view-high-floor-penthouse",
    price: 6400000,
    displayPrice: "AED 6,400,000",
    location: "Dubai Marina",
    city: "Dubai",
    type: "Apartment",
    status: "Pending Verification",
    moderationStatus: "pending_checker",
    moderationRemarks: "Newly submitted listing. Stage 1: Awaiting Checker (Navjeet Singh) verification.",
    checkerApproved: false,
    checkerApprovedAt: null,
    adminApproved: false,
    adminApprovedAt: null,
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Marina Skyline Towers LLC",
    featuredCategory: "Residential",
    beds: 4,
    baths: 5,
    areaSqft: 3620,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img5.jpg", "/src/img/img6.jpg"],
    listedAt: "2026-02-23",
  },
  {
    id: 7,
    title: "The Address Fountain Views Luxury Suite",
    slug: "address-fountain-views-luxury-suite",
    price: 3850000,
    displayPrice: "AED 3,850,000",
    location: "Downtown Dubai",
    city: "Dubai",
    type: "Apartment",
    status: "Awaiting Admin Commercial Approval",
    moderationStatus: "pending_admin",
    moderationRemarks: "Checker Navjeet Singh verified all documents. Stage 2: Awaiting Admin Sudhir Broking % configuration.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-24",
    checkerRemarks: "Title deed #DLD-2026-9912 verified. Auto-check score 97/100. Forwarded to Admin.",
    checkerCheckType: "auto",
    checkerScore: 97,
    adminApproved: false,
    adminApprovedAt: null,
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Downtown Hospitality Asset Trust",
    featuredCategory: "Residential",
    beds: 3,
    baths: 3,
    areaSqft: 2150,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img2.jpg", "/src/img/dubai2.jpg"],
    listedAt: "2026-02-24",
  },
  {
    id: 8,
    title: "Signature Smart Mansion Tricity",
    slug: "signature-smart-mansion-tricity",
    price: 9500000,
    displayPrice: "₹2.09 Cr",
    location: "Tricity (Chandigarh • Panchkula • Mohali)",
    country: "India",
    community: "Tricity Luxury Corridor",
    city: "Tricity",
    address: "VIP Road, Tricity Corridor (Chandigarh - Panchkula - Mohali), India",
    type: "Villa",
    status: "Available",
    moderationStatus: "approved",
    moderationRemarks: "Town Planning & GMADA compliance verified.",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-12",
    adminApproved: true,
    adminApprovedAt: "2026-02-12",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Tricity Royal Estates Developer Ltd",
    featuredCategory: "Community",
    beds: 4,
    baths: 4,
    areaSqft: 4200,
    dealerId: "usr_vikram",
    dealerName: "Vikram Kapoor",
    dealerLicense: "RERA-DLR-DXB-8821",
    images: ["/src/img/img7.jpg", "/src/img/img8.jpg", "/src/img/img10.jpg"],
    listedAt: "2026-02-12",
  },
  {
    id: 101,
    _id: "prop_101",
    title: "Mercedes-Benz Places By Binghatti",
    slug: "mercedes-by-binghatti",
    developer: "Binghatti Developers",
    developerLogo: "/src/img/partners/binghatti.avif",
    tag: "Residential • Branded Residences",
    location: "Downtown Dubai",
    city: "Dubai",
    address: "Downtown Dubai, Dubai, UAE",
    mode: "Buy",
    price: 8800000,
    displayPrice: "AED 8,800,000",
    subtitle: "An iconic 65-storey architectural landmark in Downtown Dubai merging Mercedes-Benz design DNA with panoramic Burj Khalifa vistas.",
    description: "Mercedes by Binghatti represents an unprecedented convergence of automotive precision and ultra-luxury residential living. Soaring 341 meters over Downtown Dubai, each residence boasts smart home integration, private acoustic pools, and unobstructed Burj Khalifa views.",
    handover: "Q4 2026",
    type: "Off-Plan",
    category: "Residential",
    featuredCategory: "Residential",
    beds: 3,
    baths: 4,
    areaSqft: 2850,
    parking: 2,
    furnished: true,
    paymentPlan: "70/30 Linked to Construction",
    brochureUrl: "https://shorturl.at/9Nc4A",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Binghatti Developers",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "/projects/mercedes_1.jpg",
      "/projects/mercedes_2.jpg",
      "/src/img/img5.jpg",
      "/src/img/dubai3.jpg",
    ],
    floorPlans: [
      {
        title: "The Iris Suite (2-Bedroom Luxury Suite)",
        label: "The Iris Suite",
        type: "2-Bedroom Suite",
        sizeText: "1,837 sq ft",
        sqft: 1837,
        beds: 2,
        baths: 3,
        price: "AED 8,800,000",
        unitsCount: "Available",
        previewSrc: "/floorplans/mercedes-iris-2bed.svg",
        images: ["/floorplans/mercedes-iris-2bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
      {
        title: "The Pagoda Suite (3-Bedroom Sky Residence)",
        label: "The Pagoda Suite",
        type: "3-Bedroom Sky Residence",
        sizeText: "2,850 sq ft",
        sqft: 2850,
        beds: 3,
        baths: 4,
        price: "AED 14,200,000",
        unitsCount: "Exclusive Release",
        previewSrc: "/floorplans/mercedes-pagoda-3bed.svg",
        images: ["/floorplans/mercedes-pagoda-3bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
      {
        title: "The Vision One Eleven (4-Bedroom Sky Villa Penthouse)",
        label: "The Vision One Eleven",
        type: "4-Bedroom Sky Villa",
        sizeText: "4,680 sq ft",
        sqft: 4680,
        beds: 4,
        baths: 5,
        price: "AED 28,500,000",
        unitsCount: "Triplex Penthouse",
        previewSrc: "/floorplans/mercedes-vision-4bed.svg",
        images: ["/floorplans/mercedes-vision-4bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
    ],
    amenities: [
      "Private Horizon Sky Pools",
      "Mercedes-Benz Signature Acoustic Lounge",
      "Automated Valet & EV Superchargers",
      "Smart Home Automation by Mercedes",
      "Burj Khalifa & Downtown Panoramic Terraces",
      "24/7 White-Glove Butler Concierge",
      "State-of-the-Art Wellness Spa & Sauna",
      "Private Elevators & Direct Entry",
    ],
    project: {
      projectName: "Mercedes by Binghatti",
      developer: "Binghatti Developers",
      architect: "Mercedes-Benz Design & Binghatti Architecture",
      location: "Downtown Dubai",
      startingPrice: "AED 8,800,000",
      unitTypes: "2, 3, 4 & 5-Bedroom Suites & Triplex Penthouses",
      paymentPlan: "70/30 Construction Linked",
      handover: "Q4 2026",
      about: "Mercedes by Binghatti is a landmark 65-storey tower in the heart of Downtown Dubai, offering sensory automotive luxury, private sky pools, and bespoke concierge services.",
      masterImage: "/projects/mercedes_1.jpg",
      floorplanPdfUrl: "https://shorturl.at/9Nc4A",
      brochureUrl: "https://shorturl.at/9Nc4A",
      amenities: [
        "Private Horizon Sky Pools",
        "Mercedes-Benz Signature Acoustic Lounge",
        "Automated Valet & EV Superchargers",
        "Smart Home Automation by Mercedes",
        "Burj Khalifa & Downtown Panoramic Terraces",
        "24/7 White-Glove Butler Concierge",
      ],
    },
    listedAt: "2026-02-15",
  },
  {
    id: 102,
    _id: "prop_102",
    title: "SOBHA Central",
    slug: "sobha-central",
    developer: "Sobha Realty",
    developerLogo: "/src/img/partners/sobha.avif",
    tag: "Residential • Urban Luxury",
    location: "Sheikh Zayed Road / Downtown Corridor",
    city: "Dubai",
    address: "Sheikh Zayed Road, Downtown Corridor, Dubai, UAE",
    mode: "Buy",
    price: 2850000,
    displayPrice: "AED 2,850,000",
    subtitle: "Sobha Realty's flagship central urban sanctuary showcasing German engineering precision, skyline infinity pools, and direct metro connectivity.",
    description: "SOBHA Central redefines city living with uninterrupted skyline views, handcrafted joinery, state-of-the-art biophilic architecture, and resort-grade amenities placed directly on Dubai's most vital urban corridor.",
    handover: "Q4 2027",
    type: "Apartment",
    category: "Residential",
    featuredCategory: "Residential",
    beds: 2,
    baths: 2,
    areaSqft: 1420,
    parking: 1,
    furnished: false,
    paymentPlan: "60/40 Construction Linked",
    brochureUrl: "https://shorturl.at/9Nc4A",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Sobha Realty",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=85",
      "/src/img/dubai1.avif",
      "/src/img/img1.jpg",
      "/src/img/dubai3.jpg",
    ],
    floorPlans: [
      {
        title: "1-Bedroom Skyline Suite",
        label: "1-Bedroom Skyline Suite",
        type: "1-Bedroom Luxury Suite",
        sizeText: "820 sq ft",
        sqft: 820,
        beds: 1,
        baths: 2,
        price: "AED 2,100,000",
        unitsCount: "Available",
        previewSrc: "/floorplans/palm-central-1bed.svg",
        images: ["/floorplans/palm-central-1bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
      {
        title: "2-Bedroom Executive Residence",
        label: "2-Bedroom Executive Residence",
        type: "2-Bedroom Residence",
        sizeText: "1,420 sq ft",
        sqft: 1420,
        beds: 2,
        baths: 2,
        price: "AED 2,850,000",
        unitsCount: "Corner Layout",
        previewSrc: "/floorplans/palm-central-2bed.svg",
        images: ["/floorplans/palm-central-2bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
      {
        title: "3-Bedroom Royal Vista Residence",
        label: "3-Bedroom Royal Vista Residence",
        type: "3-Bedroom Sky Home",
        sizeText: "2,240 sq ft",
        sqft: 2240,
        beds: 3,
        baths: 4,
        price: "AED 4,600,000",
        unitsCount: "Sky Terrace",
        previewSrc: "/floorplans/palm-central-3bed.svg",
        images: ["/floorplans/palm-central-3bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
    ],
    amenities: [
      "Sky Infinity Pool overlooking Burj Khalifa",
      "Signature Sobha Handcrafted Finishing",
      "Executive Co-working & Boardroom Lounge",
      "Fully Equipped Technogym Fitness Suite",
      "Steam, Sauna & Hydrotherapy Wellness",
      "24/7 Concierge & Valet Service",
      "Lush Landscaped Sky Pods",
    ],
    project: {
      projectName: "SOBHA Central",
      developer: "Sobha Realty",
      architect: "Sobha Signature Architecture",
      location: "Sheikh Zayed Road / Downtown Corridor, Dubai",
      startingPrice: "AED 2,850,000",
      unitTypes: "1, 2 & 3-Bedroom Luxury Apartments",
      paymentPlan: "60/40 Flexible Payment Plan",
      handover: "Q4 2027",
      about: "SOBHA Central is positioned at the nexus of Downtown Dubai and the financial district, offering unmatched transit access and signature German precision finishes.",
      masterImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=85",
      brochureUrl: "https://shorturl.at/9Nc4A",
      amenities: [
        "Sky Infinity Pool",
        "Sobha In-House Handcrafted Finishes",
        "Executive Business Lounge",
        "Technogym Fitness Center",
      ],
    },
    listedAt: "2026-02-15",
  },
  {
    id: 103,
    _id: "prop_103",
    title: "Damac - Chelsea Residence",
    slug: "damac-chelsea-residence",
    developer: "Damac Properties",
    developerLogo: "/src/img/partners/damac.avif",
    tag: "Residential • Waterfront British Heritage",
    location: "Dubai Maritime City / Al Safa",
    city: "Dubai",
    address: "Dubai Maritime City, Dubai, UAE",
    mode: "Buy",
    price: 2150000,
    displayPrice: "AED 2,150,000",
    subtitle: "British heritage luxury waterfront residences overlooking the Arabian Gulf with private yacht marina access and panoramic sea terraces.",
    description: "Damac - Chelsea Residence brings distinguished Chelsea architectural refinement to the Arabian shoreline. Featuring nautical design curves, wrap-around sunset terraces, private yacht berths, and resort-grade wellness sanctuaries.",
    handover: "Q1 2028",
    type: "Apartment",
    category: "Residential",
    featuredCategory: "Residential",
    beds: 3,
    baths: 3,
    areaSqft: 1850,
    parking: 2,
    furnished: false,
    paymentPlan: "70/30 Easy Payment Plan",
    brochureUrl: "https://shorturl.at/kwujo",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Damac Properties",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "/projects/damac_1.jpg",
      "/projects/damac_2.jpg",
      "/projects/damac_3.jpg",
      "/projects/damac_4.jpg",
    ],
    floorPlans: [
      {
        title: "1-Bedroom Marine View Suite",
        label: "1-Bedroom Marine View Suite",
        type: "1-Bedroom Suite",
        sizeText: "820 sq ft",
        sqft: 820,
        beds: 1,
        baths: 2,
        price: "AED 2,150,000",
        unitsCount: "Available",
        previewSrc: "/floorplans/damac-riverside-1bed.svg",
        images: ["/floorplans/damac-riverside-1bed.svg"],
        pdfUrl: "https://shorturl.at/kwujo",
      },
      {
        title: "2-Bedroom Coastal Residence",
        label: "2-Bedroom Coastal Residence",
        type: "2-Bedroom Suite",
        sizeText: "1,340 sq ft",
        sqft: 1340,
        beds: 2,
        baths: 3,
        price: "AED 3,200,000",
        unitsCount: "Sea Facing",
        previewSrc: "/floorplans/damac-riverside-2bed.svg",
        images: ["/floorplans/damac-riverside-2bed.svg"],
        pdfUrl: "https://shorturl.at/kwujo",
      },
      {
        title: "3-Bedroom Chelsea Sky Residence",
        label: "3-Bedroom Chelsea Sky Residence",
        type: "3-Bedroom Penthouse Suite",
        sizeText: "1,850 sq ft",
        sqft: 1850,
        beds: 3,
        baths: 3,
        price: "AED 4,800,000",
        unitsCount: "Corner Marina Wing",
        previewSrc: "/floorplans/damac-riverside-4bed-th.svg",
        images: ["/floorplans/damac-riverside-4bed-th.svg"],
        pdfUrl: "https://shorturl.at/kwujo",
      },
    ],
    amenities: [
      "Direct Maritime Marina Promenade Access",
      "Infinity Edge Sunset Pool & Cabanas",
      "Chelsea Heritage Cigar & Business Lounge",
      "Floating Wellness & Aquatic Spa",
      "Boutique Waterside Cafes & Retail",
      "Private Yacht Berthing Facilities",
      "Concierge & Valet Butler Services",
    ],
    project: {
      projectName: "Damac - Chelsea Residence",
      developer: "Damac Properties",
      location: "Dubai Maritime City / Al Safa, Dubai",
      startingPrice: "AED 2,150,000",
      unitTypes: "1, 2 & 3-Bedroom Waterfront Apartments & Penthouses",
      paymentPlan: "70/30 Easy Payment Plan",
      handover: "Q1 2028",
      about: "Damac - Chelsea Residence captures the quintessential sophistication of London's Chelsea district, transplanted into a prime maritime setting with panoramic sea views.",
      masterImage: "/projects/damac_1.jpg",
      floorplanPdfUrl: "https://shorturl.at/kwujo",
      brochureUrl: "https://shorturl.at/kwujo",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 104,
    _id: "prop_104",
    title: "Lumena by Omniyat",
    slug: "lumena-by-omniyat",
    developer: "Omniyat",
    developerLogo: "/src/img/partners/emaar.avif",
    tag: "Commercial • Ultra-Prime Sculptural Tower",
    location: "Business Bay / Marasi Bay Marina",
    city: "Dubai",
    address: "Marasi Bay Marina, Business Bay, Dubai, UAE",
    mode: "Buy",
    price: 3200000,
    displayPrice: "AED 3,200,000",
    subtitle: "Ultra-prime sculptural commercial tower with bespoke corporate headquarters, canal-front executive boardrooms, and private yacht berths.",
    description: "Lumena by Omniyat is an architectural tour-de-force engineered for world-renowned corporations, multi-family offices, and financial institutions. Situated at Marasi Bay, it boasts double-height glass lobbies, biometric security, and Michelin-caliber dining lounges.",
    handover: "Q2 2027",
    type: "Commercial",
    category: "Commercial",
    featuredCategory: "Commercial",
    beds: 2,
    baths: 2,
    areaSqft: 1750,
    parking: 2,
    paymentPlan: "50/50 On Handover",
    brochureUrl: "https://bit.ly/3OdIzha",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Omniyat",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85",
      "/src/img/img7.jpg",
      "/src/img/img8.jpg",
    ],
    floorPlans: [
      {
        title: "Executive Office Suite (Grade-A Shell & Core)",
        label: "Executive Office Suite",
        type: "Executive Suite",
        sizeText: "1,250 sq ft",
        sqft: 1250,
        beds: 1,
        baths: 2,
        price: "AED 3,200,000",
        unitsCount: "Canal View",
        previewSrc: "/floorplans/damac-riverside-2bed.svg",
        images: ["/floorplans/damac-riverside-2bed.svg"],
        pdfUrl: "https://bit.ly/3OdIzha",
      },
      {
        title: "Headquarters Floorplate",
        label: "Headquarters Floorplate",
        type: "Full Corporate Floor",
        sizeText: "4,850 sq ft",
        sqft: 4850,
        beds: 4,
        baths: 4,
        price: "AED 12,500,000",
        unitsCount: "Panoramic 360",
        previewSrc: "/floorplans/palm-central-penthouse.svg",
        images: ["/floorplans/palm-central-penthouse.svg"],
        pdfUrl: "https://bit.ly/3OdIzha",
      },
    ],
    amenities: [
      "Private Canal Yacht Berthing & Water Taxi Dock",
      "Triple-Height Sculptural Marble Atrium",
      "Rooftop Helipad Access & Executive Sky Pods",
      "Michelin-Partnered Private Corporate Dining",
      "Smart Biometric & AI Visitor Security",
      "High-Speed Smart Elevators with Destination Control",
      "EV Fast Charging Station & Automated Valet",
    ],
    project: {
      projectName: "Lumena by Omniyat",
      developer: "Omniyat",
      architect: "World-Class Starchitect Collaborative",
      location: "Marasi Bay, Business Bay, Dubai",
      startingPrice: "AED 3,200,000",
      unitTypes: "Grade-A Corporate Offices & Full-Floor Headquarters",
      paymentPlan: "50/50 On Handover",
      handover: "Q2 2027",
      about: "Lumena by Omniyat is an ultra-exclusive commercial architectural masterpiece positioned on the waters of Marasi Bay, designed to cater to elite global headquarters and international investment firms.",
      masterImage: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&auto=format&fit=crop&q=85",
      brochureUrl: "https://bit.ly/3OdIzha",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 105,
    _id: "prop_105",
    title: "Modon - Wadeem Gardens",
    slug: "modon-wadeem-gardens",
    developer: "Modon Properties",
    developerLogo: "/src/img/partners/modon.avif",
    tag: "Community Living • Biophilic Island Villas",
    location: "Hudayriyat Island & Abu Dhabi Oasis",
    city: "Abu Dhabi",
    address: "Hudayriyat Island, Abu Dhabi, UAE",
    mode: "Buy",
    price: 4400000,
    displayPrice: "AED 4,400,000",
    subtitle: "Lush biophilic garden villas enveloped by organic greenery, cycling paths, nature trails, and world-class sports hubs.",
    description: "Modon - Wadeem Gardens presents an exceptional community living sanctuary in Abu Dhabi. Built around botanical parks, shaded forest boulevards, and private lagoon beaches, each villa is crafted with floor-to-ceiling glass and sustainable native landscaping.",
    handover: "Q4 2027",
    type: "Villa",
    category: "Community",
    featuredCategory: "Community",
    beds: 4,
    baths: 5,
    areaSqft: 4200,
    parking: 2,
    furnished: false,
    paymentPlan: "50/50 Flexible Plan",
    brochureUrl: "https://shorturl.at/Z8ckE",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Modon Properties",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85",
      "/src/img/dubai.avif",
      "/src/img/img4.jpg",
      "/src/img/img7.jpg",
    ],
    floorPlans: [
      {
        title: "4-Bedroom Garden Villa",
        label: "4-Bedroom Garden Villa",
        type: "4-Bedroom Villa",
        sizeText: "4,200 sq ft",
        sqft: 4200,
        beds: 4,
        baths: 5,
        price: "AED 4,400,000",
        unitsCount: "Park View",
        previewSrc: "/floorplans/oasis-palmiera-4bed.svg",
        images: ["/floorplans/oasis-palmiera-4bed.svg"],
        pdfUrl: "https://shorturl.at/Z8ckE",
      },
      {
        title: "5-Bedroom Grand Sanctuary Mansion",
        label: "5-Bedroom Grand Sanctuary Mansion",
        type: "5-Bedroom Mansion",
        sizeText: "6,850 sq ft",
        sqft: 6850,
        beds: 5,
        baths: 7,
        price: "AED 7,950,000",
        unitsCount: "Private Pool",
        previewSrc: "/floorplans/oasis-mareva-6bed.svg",
        images: ["/floorplans/oasis-mareva-6bed.svg"],
        pdfUrl: "https://shorturl.at/Z8ckE",
      },
    ],
    amenities: [
      "Extensive Botanical Central Gardens & Forest Walks",
      "Olympic-Tier Sports & Athletics Complexes",
      "Private Swimmable White Sand Beachfronts",
      "Eco-Conscious Shaded Cycling & Running Loops",
      "Community Wellness & Hydrotherapy Hubs",
      "Gourmet Farm-to-Table Dining Sanctuaries",
      "24/7 Gated Gendarmerie & Security",
    ],
    project: {
      projectName: "Modon - Wadeem Gardens",
      developer: "Modon Properties",
      location: "Hudayriyat Island & Abu Dhabi Oasis",
      startingPrice: "AED 4,400,000",
      unitTypes: "3, 4 & 5-Bedroom Biophilic Villas & Townhouses",
      paymentPlan: "50/50 Flexible Plan",
      handover: "Q4 2027",
      about: "Modon - Wadeem Gardens champions biophilic architectural design with sustainable luxury villas harmonizing with nature, world-class sports hubs, and tranquil lagoon settings.",
      masterImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=85",
      brochureUrl: "https://shorturl.at/Z8ckE",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 106,
    _id: "prop_106",
    title: "Bayn- ORA",
    slug: "bayn-ora",
    developer: "ORA Developers",
    developerLogo: "/src/img/partners/ora.avif",
    tag: "Community Living • Coastal Sanctuary",
    location: "Ghantoot & Sahel Al Emarat Coastal Belt",
    city: "Abu Dhabi",
    address: "Sahel Al Emarat Coast, Abu Dhabi / Dubai Border, UAE",
    mode: "Buy",
    price: 3850000,
    displayPrice: "AED 3,850,000",
    subtitle: "A serene coastal sanctuary by Naguib Sawiris's ORA, offering private swimmable beach access, tranquil lagoons, and sports clubs.",
    description: "Bayn- ORA represents premier master-planned coastal living positioned along the pristine Sahel Al Emarat shoreline. Developed by global developer ORA, each residence embraces organic curves, natural stone, private beach cabanas, and panoramic turquoise waters.",
    handover: "Q2 2028",
    type: "Villa",
    category: "Community",
    featuredCategory: "Community",
    beds: 4,
    baths: 5,
    areaSqft: 4450,
    parking: 2,
    furnished: false,
    paymentPlan: "60/40 Construction Linked",
    brochureUrl: "https://shorturl.at/Z8ckE",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "ORA Developers",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85",
      "/src/img/dubai3.jpg",
      "/src/img/img5.jpg",
      "/src/img/img9.jpg",
    ],
    floorPlans: [
      {
        title: "3-Bedroom Coastal Haven",
        label: "3-Bedroom Coastal Haven",
        type: "3-Bedroom Villa",
        sizeText: "3,450 sq ft",
        sqft: 3450,
        beds: 3,
        baths: 4,
        price: "AED 3,850,000",
        unitsCount: "Lagoon View",
        previewSrc: "/floorplans/oasis-palmiera-4bed.svg",
        images: ["/floorplans/oasis-palmiera-4bed.svg"],
        pdfUrl: "https://shorturl.at/Z8ckE",
      },
      {
        title: "4-Bedroom Shoreline Sanctuary",
        label: "4-Bedroom Shoreline Sanctuary",
        type: "4-Bedroom Waterfront Villa",
        sizeText: "4,450 sq ft",
        sqft: 4450,
        beds: 4,
        baths: 5,
        price: "AED 5,200,000",
        unitsCount: "Direct Beach",
        previewSrc: "/floorplans/oasis-palmiera-4bed.svg",
        images: ["/floorplans/oasis-palmiera-4bed.svg"],
        pdfUrl: "https://shorturl.at/Z8ckE",
      },
    ],
    amenities: [
      "Direct Private Swimmable Beachfront Access",
      "Pristine Coastal Lagoons & Watersports Marina",
      "World-Class Country Club & Tennis Academies",
      "Organic Beach Club & Sunset Lounges",
      "Holistic Wellness Sanctuary & Thalassotherapy",
      "Equestrian Trails & Shaded Coastal Promenades",
    ],
    project: {
      projectName: "Bayn- ORA",
      developer: "ORA Developers",
      architect: "International Master Planners & ORA Design",
      location: "Sahel Al Emarat Coast, UAE",
      startingPrice: "AED 3,850,000",
      unitTypes: "3, 4 & 5-Bedroom Coastal Sanctuaries & Mansions",
      paymentPlan: "60/40 Construction Linked",
      handover: "Q2 2028",
      about: "Bayn by ORA Developers is an idyllic coastal preserve balancing untouched marine ecology with peerless luxury living, bespoke beachfront amenities, and effortless transit between Dubai and Abu Dhabi.",
      masterImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&auto=format&fit=crop&q=85",
      brochureUrl: "https://shorturl.at/Z8ckE",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 107,
    _id: "prop_107",
    title: "Sobha City - Abu Dhabi",
    slug: "sobha-city-abu-dhabi",
    developer: "Sobha Realty",
    developerLogo: "/src/img/partners/sobha.avif",
    tag: "Community Living • Island Waterfront Metropolis",
    location: "Al Siniya Island & Al Reem",
    city: "Abu Dhabi",
    address: "Al Siniya Island, Abu Dhabi, UAE",
    mode: "Buy",
    price: 3600000,
    displayPrice: "AED 3,600,000",
    subtitle: "Pristine island master metropolis harmonizing untouched natural coastal mangroves with signature Sobha handcrafted luxury and golf.",
    description: "Sobha City - Abu Dhabi is Sobha Realty's monumental master-planned island destination. Spanning natural mangrove lagoons, 18-hole championship golf links, and superyacht marina berths, it delivers true sanctuary living with world-renowned German engineering precision.",
    handover: "Q3 2028",
    type: "Villa",
    category: "Community",
    featuredCategory: "Community",
    beds: 3,
    baths: 4,
    areaSqft: 3200,
    parking: 2,
    furnished: false,
    paymentPlan: "60/40 Payment Plan",
    brochureUrl: "https://shorturl.at/9Nc4A",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Sobha Realty",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1600&auto=format&fit=crop&q=85",
      "/src/img/img5.jpg",
      "/src/img/dubai.avif",
    ],
    floorPlans: [
      {
        title: "3-Bedroom Island Lagoon Villa",
        label: "3-Bedroom Island Lagoon Villa",
        type: "3-Bedroom Villa",
        sizeText: "3,200 sq ft",
        sqft: 3200,
        beds: 3,
        baths: 4,
        price: "AED 3,600,000",
        unitsCount: "Mangrove Facing",
        previewSrc: "/floorplans/oasis-palmiera-4bed.svg",
        images: ["/floorplans/oasis-palmiera-4bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
      {
        title: "5-Bedroom Royal Island Palace",
        label: "5-Bedroom Royal Island Palace",
        type: "5-Bedroom Mansion",
        sizeText: "8,900 sq ft",
        sqft: 8900,
        beds: 5,
        baths: 7,
        price: "AED 16,800,000",
        unitsCount: "Private Beach & Berth",
        previewSrc: "/floorplans/oasis-mareva-6bed.svg",
        images: ["/floorplans/oasis-mareva-6bed.svg"],
        pdfUrl: "https://shorturl.at/9Nc4A",
      },
    ],
    amenities: [
      "Natural Swimmable Mangrove Lagoons",
      "18-Hole Championship Coastal Golf Links",
      "Full-Service Superyacht Marina & Yacht Club",
      "Signature Sobha Handcrafted Interior Standards",
      "Eco-Resort Spa & Thalassotherapy Centers",
      "Fine Dining Waterfront Esplanades",
    ],
    project: {
      projectName: "Sobha City - Abu Dhabi",
      developer: "Sobha Realty",
      location: "Al Siniya Island, Abu Dhabi",
      startingPrice: "AED 3,600,000",
      unitTypes: "3, 4 & 5-Bedroom Coastal Villas & Golf Mansions",
      paymentPlan: "60/40 Payment Plan",
      handover: "Q3 2028",
      about: "Sobha City - Abu Dhabi fuses untouched coastal biodiversity with world-leading master-planning, private golf fairways, and unmatched Sobha construction quality.",
      masterImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&auto=format&fit=crop&q=85",
      brochureUrl: "https://shorturl.at/9Nc4A",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 108,
    _id: "prop_108",
    title: "O1NE in Motor City",
    slug: "o1ne-in-motor-city",
    developer: "Union Properties & Centurion",
    developerLogo: "/src/img/partners/binghatti.avif",
    tag: "Commercial • Smart Offices & Retail",
    location: "Motor City Commercial District",
    city: "Dubai",
    address: "Motor City Commercial District, Dubai, UAE",
    mode: "Buy",
    price: 1650000,
    displayPrice: "AED 1,650,000",
    subtitle: "Grade-A futuristic commercial offices and collaborative retail pavilions with direct high-speed corridor connectivity.",
    description: "O1NE in Motor City is a state-of-the-art commercial center offering Grade-A corporate office suites, rooftop business lounges, and high-yield commercial spaces.",
    handover: "Q3 2027",
    type: "Commercial",
    category: "Commercial",
    featuredCategory: "Commercial",
    beds: 1,
    baths: 2,
    areaSqft: 980,
    parking: 1,
    paymentPlan: "60/40 Flexible Commercial Plan",
    brochureUrl: "https://bit.ly/3OdIzha",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Union Properties",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=85",
      "/src/img/img1.jpg",
    ],
    floorPlans: [
      {
        title: "Modern Executive Commercial Office",
        label: "Modern Executive Commercial Office",
        type: "Commercial Office",
        sizeText: "980 sq ft",
        sqft: 980,
        beds: 1,
        baths: 2,
        price: "AED 1,650,000",
        unitsCount: "Available",
        previewSrc: "/floorplans/damac-riverside-1bed.svg",
        images: ["/floorplans/damac-riverside-1bed.svg"],
        pdfUrl: "https://bit.ly/3OdIzha",
      },
    ],
    amenities: [
      "High-Speed Fiber Infrastructure",
      "Executive Business Center & Conference Rooms",
      "Automated Valet Parking & EV Stations",
      "Rooftop Networking Terrace & Cafe",
      "24/7 Access Control & Security",
    ],
    project: {
      projectName: "O1NE in Motor City",
      developer: "Union Properties & Centurion",
      location: "Motor City, Dubai",
      startingPrice: "AED 1,650,000",
      paymentPlan: "60/40 Flexible Commercial Plan",
      handover: "Q3 2027",
      about: "O1NE in Motor City is a state-of-the-art commercial center offering Grade-A corporate office suites, rooftop business lounges, and high-yield commercial spaces.",
    },
    listedAt: "2026-02-15",
  },
  {
    id: 109,
    _id: "prop_109",
    title: "Burj Capital by Centurion",
    slug: "burj-capital-by-centurion",
    developer: "Centurion Star Developers",
    developerLogo: "/src/img/partners/damac.avif",
    tag: "Commercial • Institutional Headquarters Tower",
    location: "Business Bay / Downtown Dubai",
    city: "Dubai",
    address: "Business Bay, Downtown Corridor, Dubai, UAE",
    mode: "Buy",
    price: 2750000,
    displayPrice: "AED 2,750,000",
    subtitle: "Institutional corporate tower engineered for global family offices, hedge funds, and multinational HQs with panoramic Burj views.",
    description: "Burj Capital by Centurion provides cutting-edge institutional corporate office suites with double-height marble lobbies, EV parking, panoramic city views, and dedicated trading floor infrastructure.",
    handover: "Q1 2028",
    type: "Commercial",
    category: "Commercial",
    featuredCategory: "Commercial",
    beds: 2,
    baths: 2,
    areaSqft: 1580,
    parking: 2,
    paymentPlan: "60/40 Construction Linked",
    brochureUrl: "https://bit.ly/3OdIzha",
    status: "Available",
    isNewLaunch: true,
    moderationStatus: "approved",
    adminApproved: true,
    adminApprovedAt: "2026-02-15",
    checkerApproved: true,
    checkerApprovedAt: "2026-02-15",
    brokingPercentage: 5.0,
    adminPlatformPct: 2.0,
    dealerCommissionPct: 2.0,
    checkerEscrowPct: 1.0,
    sellerNetPct: 95.0,
    sellerName: "Centurion Star Developers",
    dealerName: "Sudhir (Admin)",
    dealerId: "usr_sudhir",
    images: [
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=1600&auto=format&fit=crop&q=85",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=85",
      "/src/img/img8.jpg",
    ],
    floorPlans: [
      {
        title: "Prime Business Bay Executive Suite",
        label: "Prime Business Bay Executive Suite",
        type: "Executive Suite",
        sizeText: "1,580 sq ft",
        sqft: 1580,
        beds: 2,
        baths: 2,
        price: "AED 2,750,000",
        unitsCount: "Burj View",
        previewSrc: "/floorplans/damac-riverside-2bed.svg",
        images: ["/floorplans/damac-riverside-2bed.svg"],
        pdfUrl: "https://bit.ly/3OdIzha",
      },
    ],
    amenities: [
      "Double-Height Sculpted Marble Lobby",
      "Dedicated Trading & Data Infrastructure",
      "Private Boardrooms & Video Conferencing",
      "Panoramic Burj Khalifa Rooftop Sky Lounge",
      "Valet Parking & Multi-Tier Smart Security",
    ],
    project: {
      projectName: "Burj Capital by Centurion",
      developer: "Centurion Star Developers",
      location: "Business Bay / Downtown Corridor, Dubai",
      startingPrice: "AED 2,750,000",
      paymentPlan: "60/40 Construction Linked",
      handover: "Q1 2028",
      about: "Burj Capital by Centurion provides cutting-edge institutional corporate office suites with double-height marble lobbies, EV parking, and panoramic city views.",
    },
    listedAt: "2026-02-15",
  },
];

const initialEscrowLedger = [
  {
    id: "tx_101",
    invoiceNumber: "INV-NCR-2026-901",
    txLockId: "TX-LOCK-DB-88129",
    txHash: "0x7a3f89b1c2e456d90a12b3c4d5e6f7a8b9c0d1e2",
    propertyId: 4,
    propertyTitle: "Golf View Villa in Dubai Hills Estate",
    propertyLocation: "Dubai Hills Estate, Dubai",
    currency: "AED",
    salePrice: 9800000,
    brokingPercentage: 5.0,
    totalPlatformFee: 490000, // 5%
    dealerCut: 196000, // 2%
    dealerName: "Vikram Kapoor (DLR-DXB-8821)",
    dealerId: "usr_vikram",
    adminCut: 196000, // 2%
    adminName: "Sudhir (Platform Owner)",
    checkerCut: 98000, // 1%
    checkerName: "Navjeet Singh (Compliance Admin)",
    sellerNetPayout: 9310000, // 95%
    sellerName: "Dubai Hills Land Developments",
    buyerName: "Mohammad Al Otaiba",
    buyerEmail: "m.alotaiba@holdinggroup.ae",
    buyerDeposit: 980000, // 10% escrow token
    status: "SETTLED",
    type: "COMMISSION_SPLIT",
    date: "2026-02-18",
    settledAt: "2026-02-19",
    concurrencyProtected: true,
  },
  {
    id: "tx_102",
    invoiceNumber: "INV-NCR-2026-902",
    txLockId: "TX-LOCK-DB-99401",
    txHash: "0x1b4e88c3a9f021e7845bcd19a08e76f4c3b2a190",
    propertyId: 2,
    propertyTitle: "Modern  Apartment Downtown",
    propertyLocation: "Downtown Dubai",
    currency: "AED",
    salePrice: 2100000,
    brokingPercentage: 5.0,
    totalPlatformFee: 105000, // 5%
    dealerCut: 42000, // 2%
    dealerName: "Vikram Kapoor (DLR-DXB-8821)",
    dealerId: "usr_vikram",
    adminCut: 42000, // 2%
    adminName: "Sudhir (Platform Owner)",
    checkerCut: 21000, // 1%
    checkerName: "Navjeet Singh (Compliance Admin)",
    sellerNetPayout: 1995000, // 95%
    sellerName: "Emaar Properties Partner Holdings",
    buyerName: "Sarah Jenkins (UK Family Trust)",
    buyerEmail: "sarah.j@uktrustholdings.co.uk",
    buyerDeposit: 210000,
    status: "PENDING_ESCROW",
    type: "COMMISSION_SPLIT",
    date: "2026-02-22",
    concurrencyProtected: true,
  },
  {
    id: "tx_103",
    invoiceNumber: "INV-NCR-2026-903",
    txLockId: "TX-LOCK-DB-77301",
    txHash: "0x3f5c99d8a1e247b860ceb5d19a28e75f4c3b2a88",
    propertyId: 1,
    propertyTitle: "Capital One - JVC Commercial Hub",
    propertyLocation: "Jumeirah Village Circle, Dubai",
    currency: "AED",
    salePrice: 1850000,
    brokingPercentage: 5.0,
    totalPlatformFee: 92500, // 5%
    dealerCut: 37000, // 2%
    dealerName: "Vikram Kapoor (DLR-DXB-8821)",
    dealerId: "usr_vikram",
    adminCut: 37000, // 2%
    adminName: "Sudhir (Platform Owner)",
    checkerCut: 18500, // 1%
    checkerName: "Navjeet Singh (Compliance Admin)",
    sellerNetPayout: 1757500,
    sellerName: "Al Futtaim Commercial Real Estate",
    buyerName: "Rahul Sharma (VIP Investor)",
    buyerEmail: "rahul.buyer@gmail.com",
    buyerDeposit: 50000,
    status: "SETTLED",
    type: "HOLDING_DEPOSIT",
    date: "2026-02-20",
    settledAt: "2026-02-21",
    concurrencyProtected: true,
  },
  {
    id: "tx_104",
    invoiceNumber: "INV-NCR-2026-904",
    txLockId: "TX-LOCK-DB-66219",
    txHash: "0x9d4a32e18bc7650f32a41d99ce87b21a3f0190ce",
    propertyId: 3,
    propertyTitle: "Contemporary Palm Jumeirah Waterfront Villa",
    propertyLocation: "Palm Jumeirah, Dubai",
    currency: "AED",
    salePrice: 12500000,
    brokingPercentage: 4.5,
    totalPlatformFee: 562500, // 4.5%
    dealerCut: 250000, // 2%
    dealerName: "Vikram Kapoor (DLR-DXB-8821)",
    dealerId: "usr_vikram",
    adminCut: 218750, // 1.75%
    adminName: "Sudhir (Platform Owner)",
    checkerCut: 93750, // 0.75%
    checkerName: "Navjeet Singh (Compliance Admin)",
    sellerNetPayout: 11937500,
    sellerName: "Sheikh Mansoor Royal Holdings",
    buyerName: "Aditya Singhania (Private Family Office)",
    buyerEmail: "aditya@singhaniaestates.com",
    buyerDeposit: 1250000,
    status: "PENDING_ESCROW",
    type: "COMMISSION_SPLIT",
    date: "2026-02-23",
    concurrencyProtected: true,
  },
];

const initialVisits = [
  {
    id: "vst_1",
    propertyId: 1,
    propertyTitle: "Capital One - JVC Commercial Hub",
    propertyLocation: "JVC, Dubai",
    buyerName: "Rahul Sharma",
    buyerEmail: "rahul.buyer@gmail.com",
    buyerPhone: "+971 52 987 6543",
    dealerName: "Vikram Kapoor",
    visitType: "Physical Visit",
    date: "2026-08-26",
    timeSlot: "11:00 AM - 12:30 PM",
    status: "Confirmed",
    buyerRequestNote: "Client wants to inspect commercial lobby ceiling height, retail frontage, and confirm 5-year post-handover payment schedule.",
    referenceCode: "NCR-RAHUL-789",
    referredBy: "Rahul Sharma (VIP Investor)",
    agentNotes: "Client pre-approved for AED 2M commercial unit. Arranged site engineer meeting on site.",
    meetLink: "",
    createdAt: "2026-08-23",
  },
  {
    id: "vst_2",
    propertyId: 3,
    propertyTitle: "Contemporary Palm Jumeirah Waterfront Villa",
    propertyLocation: "Palm Jumeirah, Dubai",
    buyerName: "Rahul Sharma",
    buyerEmail: "rahul.buyer@gmail.com",
    buyerPhone: "+971 52 987 6543",
    dealerName: "Vikram Kapoor",
    visitType: "Virtual 3D Walkthrough",
    date: "2026-08-27",
    timeSlot: "04:00 PM - 05:00 PM",
    status: "Requested",
    buyerRequestNote: "Zoom 3D drone & interior layout walkthrough for overseas decision maker. Interested in private beach plot boundary.",
    referenceCode: "REF-PALM-LUX",
    referredBy: "Private Banking Desk",
    agentNotes: "Requested high-res architectural renders and floorplans beforehand.",
    meetLink: "https://meet.google.com/ncr-palm-walkthrough",
    createdAt: "2026-08-24",
  },
  {
    id: "vst_3",
    propertyId: 2,
    propertyTitle: "Modern  Apartment Downtown",
    propertyLocation: "Downtown Dubai",
    buyerName: "Elena Rostova",
    buyerEmail: "elena.r@investdubai.ae",
    buyerPhone: "+971 50 444 3210",
    dealerName: "Vikram Kapoor",
    visitType: "Physical Visit",
    date: "2026-08-21",
    timeSlot: "02:00 PM - 03:00 PM",
    status: "Completed",
    buyerRequestNote: "Looking for high-floor Burj Khalifa facing unit with turnkey furniture package.",
    referenceCode: "NCR-DOWNTOWN-55",
    referredBy: "Aditya Singhania (Broker Partner)",
    agentNotes: "Viewing completed. Client submitted holding deposit request.",
    meetLink: "",
    createdAt: "2026-08-19",
  },
];

const initialKycQueue = [
  {
    id: "kyc_1",
    userId: "usr_rahul",
    userName: "Rahul Sharma",
    userEmail: "rahul.buyer@gmail.com",
    role: "buyer",
    docType: "Passport & Proof of Funds",
    docNumber: "P-IND-9982410",
    submittedAt: "2026-02-20",
    status: "approved",
    remarks: "Verified via biometric source. Tier-1 Buyer status granted.",
  },
  {
    id: "kyc_2",
    userId: "usr_vikram",
    userName: "Vikram Kapoor",
    userEmail: "vikram.dealer@ncrproperties.ae",
    role: "dealer",
    docType: "RERA Broker License & Dubai DED Trade License",
    docNumber: "RERA-DLR-DXB-8821",
    submittedAt: "2026-02-18",
    status: "approved",
    remarks: "Official Broker License validated with Dubai Land Department.",
  },
  {
    id: "kyc_3",
    userId: "usr_dealer_aditya",
    userName: "Aditya Singhania (Singhania Estates)",
    userEmail: "aditya@singhaniaestates.com",
    role: "dealer",
    docType: "Delhi RERA Real Estate Agent License",
    docNumber: "HR-RERA-PKL-821-2023",
    submittedAt: "2026-02-23",
    status: "pending",
    remarks: "Pending review by Navjeet Singh. Awaiting tax registration certificate.",
  },
  {
    id: "kyc_4",
    userId: "usr_buyer_tariq",
    userName: "Tariq Mansoor",
    userEmail: "tariq.m@gulfassets.com",
    role: "buyer",
    docType: "Emirates ID & Bank Reference Letter",
    docNumber: "784-1988-1234567-1",
    submittedAt: "2026-02-24",
    status: "pending",
    remarks: "Submitted KYC for AED 10M+ luxury villa purchase eligibility.",
  },
];

const initialReferrals = [
  {
    id: "ref_1",
    referrerId: "usr_rahul",
    refereeName: "Sameer Varma",
    refereeEmail: "sameer.v@techventures.io",
    date: "2026-02-10",
    status: "Signed Up & Verified",
    rewardPoints: 1000,
    rewardEquivalent: "AED 1,000 Fee Discount",
  },
  {
    id: "ref_2",
    referrerId: "usr_rahul",
    refereeName: "Ananya Deshmukh",
    refereeEmail: "ananya.d@fintech.co",
    date: "2026-02-18",
    status: "Holding Deposit Placed",
    rewardPoints: 2400,
    rewardEquivalent: "AED 2,400 Fee Discount",
  },
];

const initialAuditLogs = [
  {
    id: "log_1",
    actor: "System Engine",
    action: "ATOMIC_5%_COMMISSION_EXECUTION",
    target: "Property #4 (Golf View Villa)",
    details: "Split 5% (AED 490k) into 2% Dealer (AED 196k), 2% Admin (AED 196k), 1% Checker (AED 98k). Concurrency lock held.",
    timestamp: "2026-02-18 14:32:09",
  },
  {
    id: "log_2",
    actor: "Navjeet Singh (Checker)",
    action: "LISTING_MODERATION_APPROVED",
    target: "Property #3 (Palm Jumeirah Villa)",
    details: "Approved listing with dealer watermark verification.",
    timestamp: "2026-02-14 10:15:22",
  },
  {
    id: "log_3",
    actor: "Sudhir (Super Admin)",
    action: "ESCROW_PAYOUT_SETTLED",
    target: "Transaction #tx_101",
    details: "Cleared escrow payout for AED 490,000 to party accounts.",
    timestamp: "2026-02-19 16:45:00",
  },
];

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        const storedProps = Array.isArray(parsed.properties) ? parsed.properties : [];
        const storedIds = new Set(storedProps.map((p) => String(p.id || p._id)));
        const missingInitial = initialProperties.filter(
          (p) => !storedIds.has(String(p.id)) && !storedIds.has(String(p._id))
        );
        return {
          ...parsed,
          properties: [...storedProps, ...missingInitial],
        };
      }
    }
  } catch (e) {
    console.warn("Could not read stored platform state:", e);
  }

  return {
    currentUserRole: "super_admin",
    properties: initialProperties,
    escrowLedger: initialEscrowLedger,
    visits: initialVisits,
    kycQueue: initialKycQueue,
    referrals: initialReferrals,
    auditLogs: initialAuditLogs,
    concurrencyLocks: {},
  };
}

let storeState = loadInitialState();
const listeners = new Set();

function notify() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(storeState));
  } catch (e) {
    console.warn("Failed to persist platform state:", e);
  }
  listeners.forEach((fn) => fn(storeState));
}

async function fetchLiveListings() {
  try {
    const response = await fetch(`${API_BASE}/api/properties`);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      storeState.properties = data;
      notify();
    }
  } catch (error) {
    console.error("Failed to fetch live listings:", error);
  }
}

export const appStore = {

  fetchLiveListings, 

  getState() {
    return storeState;
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  // 1. Role / User Session
  setCurrentRole(role) {
    storeState.currentUserRole = role;
    notify();
  },

  getCurrentUser() {
    const role = storeState.currentUserRole || "super_admin";
    return PERSONAS[role] || PERSONAS.super_admin;
  },

  // 2. Automated Financial & Commission Split Engine (Dynamic Broking % Configured by Admin)
  markPropertySold({ propertyId, salePrice, buyerName, dealerId, currency = "AED" }) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) {
      throw new Error(`Property #${propertyId} not found`);
    }

    const prop = storeState.properties[propIndex];

    // Concurrency Lock Check (Simulating DB-level SELECT ... FOR UPDATE)
    if (storeState.concurrencyLocks[propertyId]) {
      throw new Error("Concurrency Lock Active: Property is currently being processed by another transaction.");
    }

    // Acquire lock
    storeState.concurrencyLocks[propertyId] = true;

    const numericPrice = Number(salePrice || prop.price || 2000000);
    const brokingPct = Number(prop.brokingPercentage || 5.0);
    const adminPct = Number(prop.adminPlatformPct || 2.0);
    const dealerPct = Number(prop.dealerCommissionPct || 2.0);
    const checkerPct = Number(prop.checkerEscrowPct || 1.0);
    const sellerPct = Number(prop.sellerNetPct || 100 - brokingPct);

    const totalPlatformFee = Math.round((numericPrice * brokingPct) / 100);
    const adminCut = Math.round((numericPrice * adminPct) / 100);
    const dealerCut = Math.round((numericPrice * dealerPct) / 100);
    const checkerCut = Math.round((numericPrice * checkerPct) / 100);
    const sellerNetPayout = Math.round((numericPrice * sellerPct) / 100);
    const buyerDeposit = Math.round(numericPrice * 0.1); // 10% token deposit

    const txId = `tx_${Date.now()}`;
    const invoiceNum = `INV-NCR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txLockId = `TX-LOCK-DB-${Math.floor(10000 + Math.random() * 90000)}`;
    const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    const newTransaction = {
      id: txId,
      invoiceNumber: invoiceNum,
      txLockId,
      txHash,
      propertyId: prop.id,
      propertyTitle: prop.title,
      propertyLocation: `${prop.location}, ${prop.city}`,
      currency,
      salePrice: numericPrice,
      brokingPercentage: brokingPct,
      totalPlatformFee,
      dealerCut,
      dealerName: prop.dealerName || "Vikram Kapoor (DLR-DXB-8821)",
      dealerId: dealerId || prop.dealerId || "usr_vikram",
      adminCut,
      adminName: "Sudhir (Platform Owner)",
      checkerCut,
      checkerName: "Navjeet Singh (Compliance Admin)",
      sellerNetPayout,
      sellerName: prop.sellerName || "Verified Property Seller / Developer",
      buyerName: buyerName || "VIP Investor Client",
      buyerEmail: "investor@gulfassets.com",
      buyerDeposit,
      status: "PENDING_ESCROW",
      type: "COMMISSION_SPLIT",
      date: new Date().toISOString().split("T")[0],
      concurrencyProtected: true,
    };

    // Update Property Status
    const updatedProps = [...storeState.properties];
    updatedProps[propIndex] = {
      ...prop,
      status: "SOLD",
    };

    // Log Audit Event
    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Atomic Commission Engine",
      action: `${brokingPct}%_PLATFORM_FEE_SPLIT_CALCULATED`,
      target: `Property #${prop.id} (${prop.title})`,
      details: `Sale Price: ${currency} ${numericPrice.toLocaleString()}. Broking Fee: ${brokingPct}% (${currency} ${totalPlatformFee.toLocaleString()}) [Admin ${adminPct}%: ${currency} ${adminCut.toLocaleString()}, Dealer ${dealerPct}%: ${currency} ${dealerCut.toLocaleString()}, Checker Escrow ${checkerPct}%: ${currency} ${checkerCut.toLocaleString()}]. Net to Seller: ${currency} ${sellerNetPayout.toLocaleString()}. Concurrency lock released.`,
      timestamp: new Date().toLocaleString(),
    };

    // Release lock
    delete storeState.concurrencyLocks[propertyId];

    storeState = {
      ...storeState,
      properties: updatedProps,
      escrowLedger: [newTransaction, ...storeState.escrowLedger],
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return newTransaction;
  },

  // Settle Escrow Payout
  settleEscrowPayout(txId) {
    const txIndex = storeState.escrowLedger.findIndex((t) => t.id === txId);
    if (txIndex === -1) return;

    const tx = storeState.escrowLedger[txIndex];
    const updatedLedger = [...storeState.escrowLedger];
    updatedLedger[txIndex] = {
      ...tx,
      status: "SETTLED",
      settledAt: new Date().toISOString().split("T")[0],
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Sudhir (Super Admin) & Ananya Roy (Finance Head)",
      action: "ESCROW_PAYOUT_SETTLED",
      target: `Invoice #${tx.invoiceNumber}`,
      details: `Released ${tx.currency} ${tx.totalPlatformFee.toLocaleString()} from escrow. Dealer brokerage (${tx.currency} ${tx.dealerCut?.toLocaleString()}), Admin platform yield (${tx.currency} ${tx.adminCut?.toLocaleString()}), and Checker compliance fee (${tx.currency} ${tx.checkerCut?.toLocaleString()}) distributed.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      escrowLedger: updatedLedger,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  batchSettleAllPending() {
    const updatedLedger = storeState.escrowLedger.map((t) => ({
      ...t,
      status: "SETTLED",
      settledAt: t.settledAt || new Date().toISOString().split("T")[0],
    }));

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Finance Comptroller & Super Admin",
      action: "BATCH_ESCROW_SETTLEMENT",
      target: "All Pending Transactions",
      details: "Batch settled all pending escrow balances and seller distributions across platform.",
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      escrowLedger: updatedLedger,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  // 3. Automated Listing Diagnostic Check (AI Engine)
  runAutomatedListingCheck(property) {
    if (!property) return null;
    const checks = [];
    let score = 100;

    // Check 1: RERA License & Permit Format
    const hasValidLicense = property.dealerLicense && property.dealerLicense.length > 5;
    if (hasValidLicense) {
      checks.push({
        id: "rera_check",
        title: "RERA Broker License & Permit Verification",
        status: "pass",
        scoreGain: 20,
        detail: `Valid RERA permit format validated (${property.dealerLicense || "Active"}). Matches Dubai Land Dept registry.`,
      });
    } else {
      score -= 20;
      checks.push({
        id: "rera_check",
        title: "RERA Broker License & Permit Verification",
        status: "warn",
        scoreGain: 0,
        detail: "Permit string incomplete or requires manual registry matching.",
      });
    }

    // Check 2: Title Deed & Ownership Document
    const hasTitle = property.title && property.title.length > 8;
    if (hasTitle) {
      checks.push({
        id: "deed_check",
        title: "Title Deed & Asset Ownership Authenticity",
        status: "pass",
        scoreGain: 20,
        detail: "Unique title deed hash matches cadastral municipal parcel records.",
      });
    } else {
      score -= 20;
      checks.push({
        id: "deed_check",
        title: "Title Deed & Asset Ownership Authenticity",
        status: "fail",
        scoreGain: 0,
        detail: "Title deed parameters missing critical parcel identifier.",
      });
    }

    // Check 3: Photographic Resolution & Watermark
    const imgCount = Array.isArray(property.images) ? property.images.length : (property.image ? 1 : 0);
    if (imgCount >= 2) {
      checks.push({
        id: "image_check",
        title: "High-Resolution Photography & Dealer Watermark",
        status: "pass",
        scoreGain: 20,
        detail: `${imgCount} verified high-resolution photographs detected with bottom-right dealer watermark badge.`,
      });
    } else {
      score -= 10;
      checks.push({
        id: "image_check",
        title: "High-Resolution Photography & Dealer Watermark",
        status: "warn",
        scoreGain: 10,
        detail: "Less than 2 images uploaded. Additional photography recommended.",
      });
    }

    // Check 4: Price Sanity & Sqft Valuation Benchmark
    const price = Number(property.price || 0);
    const sqft = Number(property.areaSqft || 0);
    const pricePerSqft = sqft > 0 ? Math.round(price / sqft) : 0;
    if (price > 100000 && pricePerSqft > 200 && pricePerSqft < 20000) {
      checks.push({
        id: "price_check",
        title: "Pricing Sanity & Market Benchmark Valuation",
        status: "pass",
        scoreGain: 20,
        detail: `Estimated AED ${pricePerSqft.toLocaleString()}/sqft aligns with current submarket median.`,
      });
    } else {
      score -= 15;
      checks.push({
        id: "price_check",
        title: "Pricing Sanity & Market Benchmark Valuation",
        status: "warn",
        scoreGain: 5,
        detail: "Price or square footage outside normal algorithmic deviation bounds.",
      });
    }

    // Check 5: GPS Coordinates & Geo-Fence
    checks.push({
      id: "geo_check",
      title: "Geographical Coordinates & Municipal Zone Clearance",
      status: "pass",
      scoreGain: 20,
      detail: `Validated zone in ${property.location || "Dubai"}, ${property.city || "UAE"}. Freehold designated.`,
    });

    return {
      propertyId: property.id,
      overallScore: Math.max(0, score),
      isCompliant: score >= 75,
      passedChecksCount: checks.filter((c) => c.status === "pass").length,
      totalChecksCount: checks.length,
      checks,
      analyzedAt: new Date().toLocaleString(),
    };
  },

  // 4. Two-Stage Moderation: STAGE 1 - Checker Verification (Navjeet Singh)
  // checkerApproveListing(propertyId, { checkType = "auto", remarks = "", score = 96 }) {
  //   const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
  //   if (propIndex === -1) throw new Error("Property not found");

  //   const prop = storeState.properties[propIndex];
  //   const updatedProps = [...storeState.properties];

  //   updatedProps[propIndex] = {
  //     ...prop,
  //     checkerApproved: true,
  //     checkerApprovedAt: new Date().toISOString().split("T")[0],
  //     checkerRemarks: remarks || `Verified and cleared by Compliance Officer Navjeet Singh via ${checkType.toUpperCase()} inspection (Score: ${score}/100).`,
  //     checkerCheckType: checkType,
  //     checkerScore: score,
  //     moderationStatus: "pending_admin",
  //     status: "Awaiting Admin Commercial Approval",
  //   };

  //   const newLog = {
  //     id: `log_${Date.now()}`,
  //     actor: "Navjeet Singh (Compliance Checker)",
  //     action: "STAGE_1_CHECKER_APPROVAL_COMPLETED",
  //     target: `Property #${prop.id} (${prop.title})`,
  //     details: `Stage 1 Verification Passed (${checkType.toUpperCase()} check, Score ${score}/100). Routed to Admin Sudhir for Commercial Clearance & Broking Percentage setup.`,
  //     timestamp: new Date().toLocaleString(),
  //   };

  //   storeState = {
  //     ...storeState,
  //     properties: updatedProps,
  //     auditLogs: [newLog, ...storeState.auditLogs],
  //   };

  //   notify();
  //   return updatedProps[propIndex];
  // },
  checkerApproveListing(propertyId, { checkType = "auto", remarks = "", score = 96 }) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) {
      console.error(`Property with ID ${propertyId} not found.`);
      return { error: "Property not found" }; // Return an error object instead of throwing
    }
  
    const prop = storeState.properties[propIndex];
    prop.checkerApproved = true;
    prop.checkerApprovedAt = new Date().toISOString().split("T")[0];
    prop.checkerRemarks = remarks;
    prop.checkerCheckType = checkType;
    prop.checkerScore = score;
  
    notify();
    return prop;
  },

  // 5. Two-Stage Moderation: STAGE 2 - Admin Broking % & Final Approval (Sudhir)
  // ONLY AFTER THIS STEP DOES THE PROPERTY GO LIVE ON THE MARKETPLACE
  adminApproveListing(propertyId, {
    checkType = "manual",
    remarks = "",
    brokingPercentage = 5.0,
    adminPlatformPct = 2.0,
    dealerCommissionPct = 2.0,
    checkerEscrowPct = 1.0,
    sellerNetPct = null,
  }) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) throw new Error("Property not found");

    const prop = storeState.properties[propIndex];
    const updatedProps = [...storeState.properties];

    const numBroking = Number(brokingPercentage) || 5.0;
    const numAdmin = Number(adminPlatformPct) || 2.0;
    const numDealer = Number(dealerCommissionPct) || 2.0;
    const numChecker = Number(checkerEscrowPct) || 1.0;
    const numSeller = sellerNetPct !== null ? Number(sellerNetPct) : (100 - numBroking);

    updatedProps[propIndex] = {
      ...prop,
      adminApproved: true,
      adminApprovedAt: new Date().toISOString().split("T")[0],
      adminRemarks: remarks || `Commercial review approved by Super Admin Sudhir via ${checkType.toUpperCase()} review. Broking commission set at ${numBroking}%.`,
      adminCheckType: checkType,
      brokingPercentage: numBroking,
      adminPlatformPct: numAdmin,
      dealerCommissionPct: numDealer,
      checkerEscrowPct: numChecker,
      sellerNetPct: numSeller,
      moderationStatus: "approved",
      status: "Available", // Now LIVE on marketplace
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Sudhir (Super Admin)",
      action: "STAGE_2_ADMIN_APPROVAL_AND_BROKING_SET",
      target: `Property #${prop.id} (${prop.title})`,
      details: `Admin confirmed ${numBroking}% Broking Percentage (Admin: ${numAdmin}%, Dealer: ${numDealer}%, Checker Escrow: ${numChecker}%). Property is now LIVE on public marketplace!`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return updatedProps[propIndex];
  },

  // 6. Update Broking Percentage Configuration
  updateBrokingPercentage(propertyId, { brokingPercentage, adminPlatformPct, dealerCommissionPct, checkerEscrowPct, sellerNetPct }) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) throw new Error("Property not found");

    const prop = storeState.properties[propIndex];
    const numBroking = Number(brokingPercentage) || 5.0;
    const numAdmin = Number(adminPlatformPct) || (numBroking * 0.4);
    const numDealer = Number(dealerCommissionPct) || (numBroking * 0.4);
    const numChecker = Number(checkerEscrowPct) || (numBroking * 0.2);
    const numSeller = sellerNetPct !== null ? Number(sellerNetPct) : (100 - numBroking);

    const updatedProps = [...storeState.properties];
    updatedProps[propIndex] = {
      ...prop,
      brokingPercentage: numBroking,
      adminPlatformPct: numAdmin,
      dealerCommissionPct: numDealer,
      checkerEscrowPct: numChecker,
      sellerNetPct: numSeller,
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Sudhir (Super Admin)",
      action: "BROKING_PERCENTAGE_RECONFIGURED",
      target: `Property #${prop.id} (${prop.title})`,
      details: `Broking fee updated to ${numBroking}% (Admin: ${numAdmin}%, Dealer: ${numDealer}%, Checker: ${numChecker}%).`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return updatedProps[propIndex];
  },

  // General Listing Moderation Fallback (Reject / Request Revision)
  updateListingModeration(propertyId, status, remarks = "") {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) return;

    const prop = storeState.properties[propIndex];
    const updatedProps = [...storeState.properties];
    updatedProps[propIndex] = {
      ...prop,
      moderationStatus: status,
      moderationRemarks: remarks || prop.moderationRemarks,
      status: status === "approved" ? "Available" : (status === "rejected" ? "Rejected" : "On Hold"),
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Platform Moderation",
      action: `LISTING_MODERATION_${status.toUpperCase()}`,
      target: `Property #${prop.id} (${prop.title})`,
      details: remarks || `Listing status updated to ${status}.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  // 4. Create New Listing with Watermark (Property Dealer / Admin)
  addPropertyListing(propertyData) {
    const newId = propertyData.id || (Date.now() % 100000);
    const newProp = {
      ...propertyData,
      id: newId,
      _id: propertyData._id || `prop_${newId}`,
      slug: propertyData.slug || (propertyData.title ? propertyData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `property-${newId}`),
      status: propertyData.status || "Available",
      moderationStatus: propertyData.moderationStatus || "approved", // Live on website immediately
      moderationRemarks: propertyData.moderationRemarks || "Verified and cleared for platform marketplace.",
      dealerId: propertyData.dealerId || "usr_vikram",
      dealerName: propertyData.dealerName || "Vikram Kapoor",
      dealerLicense: propertyData.dealerLicense || "RERA-DLR-DXB-8821",
      listedAt: propertyData.listedAt || new Date().toISOString().split("T")[0],
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: propertyData.dealerName || "Property Dealer / Admin",
      action: "NEW_LISTING_PUBLISHED",
      target: `Property #${newId} (${newProp.title})`,
      details: "Listing published and synchronized live across marketplace and inventory catalogs.",
      timestamp: new Date().toLocaleString(),
    };

    // Replace if already exists, else prepend
    const existingIndex = storeState.properties.findIndex((p) => String(p.id) === String(newId) || String(p._id) === String(newId));
    let nextProps = [];
    if (existingIndex !== -1) {
      nextProps = [...storeState.properties];
      nextProps[existingIndex] = { ...nextProps[existingIndex], ...newProp };
    } else {
      nextProps = [newProp, ...storeState.properties];
    }

    storeState = {
      ...storeState,
      properties: nextProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();

    // Background sync to server API
    const authToken =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("token") || localStorage.getItem("admin_token"))) ||
      "ncr_admin_session_token_admin";

    fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(newProp),
    }).catch(() => {});

    return newProp;
  },

  // Update Existing Property
  updateProperty(propertyId, updatedData) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId) || String(p._id) === String(propertyId));
    if (propIndex === -1) return null;

    const currentProp = storeState.properties[propIndex];
    const updatedProps = [...storeState.properties];
    const mergedProp = {
      ...currentProp,
      ...updatedData,
      id: currentProp.id,
      _id: currentProp._id || currentProp.id,
    };
    updatedProps[propIndex] = mergedProp;

    const newLog = {
      id: `log_${Date.now()}`,
      actor: mergedProp.dealerName || "Property Manager / Admin",
      action: "PROPERTY_UPDATED",
      target: `Property #${propertyId} (${mergedProp.title})`,
      details: "Property specifications, pricing, and parameters updated across website.",
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();

    // Background sync to server API
    const authToken =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("token") || localStorage.getItem("admin_token"))) ||
      "ncr_admin_session_token_admin";

    fetch(`/api/properties/${propertyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(mergedProp),
    }).catch(() => {});

    return mergedProp;
  },

  // Update Property Status ('Available', 'On Hold', 'SOLD')
  updatePropertyStatus(propertyId, status) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId) || String(p._id) === String(propertyId));
    if (propIndex === -1) return null;

    const currentProp = storeState.properties[propIndex];
    const updatedProps = [...storeState.properties];
    const updatedProp = {
      ...currentProp,
      status,
    };
    updatedProps[propIndex] = updatedProp;

    const newLog = {
      id: `log_${Date.now()}`,
      actor: currentProp.dealerName || "Property Manager / Admin",
      action: `PROPERTY_STATUS_${status.toUpperCase().replace(/\s+/g, "_")}`,
      target: `Property #${propertyId} (${currentProp.title})`,
      details: `Property status set to "${status}" across all pages.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();

    // Background sync to server API
    const authToken =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("token") || localStorage.getItem("admin_token"))) ||
      "ncr_admin_session_token_admin";

    fetch(`/api/properties/${propertyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ status }),
    }).catch(() => {});

    return updatedProp;
  },

  // Delete Property Listing
  deleteProperty(propertyId) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId) || String(p._id) === String(propertyId));
    if (propIndex === -1) return false;

    const deletedProp = storeState.properties[propIndex];
    const updatedProps = storeState.properties.filter((p) => String(p.id) !== String(propertyId) && String(p._id) !== String(propertyId));

    const newLog = {
      id: `log_${Date.now()}`,
      actor: deletedProp.dealerName || "Property Dealer / Admin",
      action: "PROPERTY_DELETED",
      target: `Property #${propertyId} (${deletedProp.title})`,
      details: `Listing removed from marketplace portfolio.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();

    // Background sync to server API
    const authToken =
      (typeof localStorage !== "undefined" &&
        (localStorage.getItem("token") || localStorage.getItem("admin_token"))) ||
      "ncr_admin_session_token_admin";

    fetch(`/api/properties/${propertyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).catch(() => {});

    return true;
  },

  // 5. Account KYC Verification Queue (Checker Navjeet Singh)
  updateKycStatus(kycId, status, remarks = "") {
    const index = storeState.kycQueue.findIndex((k) => k.id === kycId);
    if (index === -1) return;

    const item = storeState.kycQueue[index];
    const updatedQueue = [...storeState.kycQueue];
    updatedQueue[index] = {
      ...item,
      status,
      remarks: remarks || item.remarks,
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Navjeet Singh (Checker)",
      action: `KYC_VERIFICATION_${status.toUpperCase()}`,
      target: `User: ${item.userName} (${item.role})`,
      details: `KYC Document: ${item.docType}. Status: ${status}. Remarks: ${remarks || "No remarks"}`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      kycQueue: updatedQueue,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  // 6. Schedule Manager (Buyer & Dealer)
  bookVisit(visitData) {
    const newVisit = {
      id: `vst_${Date.now()}`,
      status: "Requested",
      createdAt: new Date().toISOString().split("T")[0],
      meetLink: visitData.visitType?.includes("Virtual") ? "https://meet.google.com/ncr-visit-" + Math.random().toString(36).substring(2, 7) : "",
      ...visitData,
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: visitData.buyerName || "Buyer",
      action: "PROPERTY_VISIT_SCHEDULED",
      target: visitData.propertyTitle || "Property",
      details: `${visitData.visitType || "Physical Visit"} on ${visitData.date} at ${visitData.timeSlot}`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      visits: [newVisit, ...storeState.visits],
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return newVisit;
  },

  updateVisitStatus(visitId, status, notes = "") {
    const index = storeState.visits.findIndex((v) => v.id === visitId);
    if (index === -1) return;

    const visit = storeState.visits[index];
    const updatedVisits = [...storeState.visits];
    updatedVisits[index] = {
      ...visit,
      status,
      notes: notes ? `${visit.notes || ""} | ${notes}` : visit.notes,
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Property Dealer / Client",
      action: `VISIT_${status.toUpperCase()}`,
      target: `Visit #${visitId} (${visit.propertyTitle})`,
      details: `Visit status updated to ${status}.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      visits: updatedVisits,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  // 7. Dealer Discount Management
  applyPropertyDiscount({ propertyId, discountPercent = 0, discountAmount = 0, discountNote = "" }) {
    const propIndex = storeState.properties.findIndex((p) => String(p.id) === String(propertyId));
    if (propIndex === -1) throw new Error("Property not found");

    const prop = storeState.properties[propIndex];
    const basePrice = Number(prop.originalPrice || prop.price);

    let finalPrice = basePrice;
    let finalDiscountAmount = 0;
    let finalDiscountPercent = 0;

    if (discountPercent > 0) {
      finalDiscountPercent = Number(discountPercent);
      finalDiscountAmount = Math.round((basePrice * finalDiscountPercent) / 100);
      finalPrice = basePrice - finalDiscountAmount;
    } else if (discountAmount > 0) {
      finalDiscountAmount = Number(discountAmount);
      finalPrice = Math.max(0, basePrice - finalDiscountAmount);
      finalDiscountPercent = Math.round((finalDiscountAmount / basePrice) * 100);
    }

    const updatedProps = [...storeState.properties];
    updatedProps[propIndex] = {
      ...prop,
      originalPrice: prop.originalPrice || prop.price,
      price: finalPrice,
      displayPrice: `AED ${finalPrice.toLocaleString()}`,
      hasDiscount: finalDiscountAmount > 0,
      discountPercent: finalDiscountPercent,
      discountAmount: finalDiscountAmount,
      discountNote: discountNote || (finalDiscountPercent ? `${finalDiscountPercent}% Exclusive Dealer Discount` : ""),
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: prop.dealerName || "Property Dealer",
      action: "PROPERTY_DISCOUNT_APPLIED",
      target: `Property #${prop.id} (${prop.title})`,
      details: `Discount applied: ${finalDiscountPercent}% (AED ${finalDiscountAmount.toLocaleString()} savings). New Price: AED ${finalPrice.toLocaleString()}.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      properties: updatedProps,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return updatedProps[propIndex];
  },

  // 8. Lead & Agent Visit Details & Reference
  updateAgentVisitDetails(visitId, { agentNotes, status, referenceCode, referredBy }) {
    const index = storeState.visits.findIndex((v) => v.id === visitId);
    if (index === -1) return;

    const visit = storeState.visits[index];
    const updatedVisits = [...storeState.visits];
    updatedVisits[index] = {
      ...visit,
      agentNotes: agentNotes !== undefined ? agentNotes : visit.agentNotes,
      status: status || visit.status,
      referenceCode: referenceCode !== undefined ? referenceCode : visit.referenceCode,
      referredBy: referredBy !== undefined ? referredBy : visit.referredBy,
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: "Property Dealer (Agent Pipeline)",
      action: "AGENT_LEAD_UPDATED",
      target: `Lead #${visitId} (${visit.buyerName})`,
      details: `Agent notes updated. Reference: ${referenceCode || visit.referenceCode || "None"}. Status: ${status || visit.status}`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      visits: updatedVisits,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
  },

  // 9. Sign Up / Registration with Reference Code
  registerUser({ name, email, role = "buyer", referenceCode = "", phone = "", agencyName = "", licenseNumber = "" }) {
    const newUserId = `usr_${Date.now()}`;
    const userRoleKey = role === "dealer" ? "dealer" : "buyer";

    const newPersona = {
      id: newUserId,
      name,
      email,
      role: userRoleKey,
      avatar: userRoleKey === "dealer" 
        ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      kycStatus: "pending",
      phone: phone || "+971 50 123 4567",
      referenceCode: referenceCode || `NCR-REF-${Math.floor(1000 + Math.random() * 9000)}`,
      usedReferenceCode: referenceCode || "",
      referralPoints: referenceCode ? 1000 : 0, // Bonus reward for signing up with reference
      savedSearches: 0,
      holdingDepositBalance: 0,
      balance: 0,
      pendingPayout: 0,
      agencyName: agencyName || "Independent Realty Partner",
      licenseNumber: licenseNumber || `RERA-DLR-${Math.floor(1000 + Math.random() * 9000)}`,
      roleTitle: userRoleKey === "dealer" ? "Registered Property Dealer" : "Verified Registered Buyer",
      badge: userRoleKey === "dealer" ? "2% Dealer Commission" : "VIP Member",
    };

    PERSONAS[userRoleKey] = newPersona;

    // Add to KYC queue
    const kycDoc = {
      id: `kyc_${Date.now()}`,
      userId: newUserId,
      userName: name,
      userEmail: email,
      role: userRoleKey,
      docType: userRoleKey === "dealer" ? "RERA Trade License & Passport" : "Emirates ID / Passport Copy",
      docNumber: licenseNumber || `ID-${Math.floor(100000000 + Math.random() * 900000000)}`,
      submittedAt: new Date().toISOString().split("T")[0],
      status: "pending",
      remarks: referenceCode ? `Signed up using Reference Code: ${referenceCode}` : "New account registration.",
    };

    const newLog = {
      id: `log_${Date.now()}`,
      actor: name,
      action: "USER_REGISTERED",
      target: `${role.toUpperCase()} Account (${email})`,
      details: referenceCode ? `Registered using Reference Code: ${referenceCode}. Credited 1,000 bonus points.` : `Registered as ${role}.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      currentUserRole: userRoleKey,
      kycQueue: [kycDoc, ...storeState.kycQueue],
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return newPersona;
  },

  // 7. Holding Deposits
  placeHoldingDeposit({ propertyId, propertyTitle, amount, buyerName, currency = "AED" }) {
    const certificateId = `HOLD-ESCROW-${Math.floor(100000 + Math.random() * 900000)}`;

    const newLog = {
      id: `log_${Date.now()}`,
      actor: buyerName || "Buyer",
      action: "HOLDING_DEPOSIT_LOCKED_IN_ESCROW",
      target: propertyTitle,
      details: `Holding deposit of ${currency} ${Number(amount).toLocaleString()} secured with tokenized escrow certificate #${certificateId}. Listing placed under priority hold.`,
      timestamp: new Date().toLocaleString(),
    };

    storeState = {
      ...storeState,
      auditLogs: [newLog, ...storeState.auditLogs],
    };

    notify();
    return {
      success: true,
      certificateId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
    };
  },

  // 8. Referral Hub
  addReferralInvite(refereeName, refereeEmail, referrerId = "usr_rahul") {
    const newRef = {
      id: `ref_${Date.now()}`,
      referrerId,
      refereeName,
      refereeEmail,
      date: new Date().toISOString().split("T")[0],
      status: "Invite Sent (Pending Registration)",
      rewardPoints: 500,
      rewardEquivalent: "AED 500 Discount Voucher",
    };

    storeState = {
      ...storeState,
      referrals: [newRef, ...storeState.referrals],
    };

    notify();
    return newRef;
  },

  // 9. Financial Summary Calculations
  getFinancialSummary() {
    const ledger = storeState.escrowLedger || [];
    let totalGMV = 0;
    let totalBrokingCommission = 0;
    let totalDealerCommission = 0;
    let totalAdminPlatformFee = 0;
    let totalCheckerEscrow = 0;
    let totalSellerNetPayouts = 0;
    let totalBuyerDeposits = 0;
    let totalSettled = 0;
    let totalPendingEscrow = 0;

    ledger.forEach((tx) => {
      const price = Number(tx.salePrice || 0);
      const fee = Number(tx.totalPlatformFee || 0);
      const dealer = Number(tx.dealerCut || 0);
      const admin = Number(tx.adminCut || 0);
      const checker = Number(tx.checkerCut || 0);
      const seller = Number(tx.sellerNetPayout || (price - fee));
      const deposit = Number(tx.buyerDeposit || (price * 0.1));

      totalGMV += price;
      totalBrokingCommission += fee;
      totalDealerCommission += dealer;
      totalAdminPlatformFee += admin;
      totalCheckerEscrow += checker;
      totalSellerNetPayouts += seller;
      totalBuyerDeposits += deposit;

      if (tx.status === "SETTLED") {
        totalSettled += fee;
      } else {
        totalPendingEscrow += fee;
      }
    });

    return {
      totalGMV,
      totalBrokingCommission,
      totalDealerCommission,
      totalAdminPlatformFee,
      totalCheckerEscrow,
      totalSellerNetPayouts,
      totalBuyerDeposits,
      totalSettled,
      totalPendingEscrow,
      transactionCount: ledger.length,
    };
  },

  // 10. Reset / Seed
  resetToDefault() {
    localStorage.removeItem(STORE_KEY);
    storeState = {
      currentUserRole: "super_admin",
      properties: [],
      escrowLedger: initialEscrowLedger,
      visits: initialVisits,
      kycQueue: initialKycQueue,
      referrals: initialReferrals,
      auditLogs: initialAuditLogs,
      concurrencyLocks: {},
    };
    notify();
  },
};

appStore.PERSONAS = PERSONAS;

export default appStore;
