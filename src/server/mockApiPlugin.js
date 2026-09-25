import { GoogleGenAI } from "@google/genai";

const seedProperties = [
  {
    id: 1,
    mode: "Buy",
    title: "Capital One - JVC",
    slug: "capital-one-jvc",
    price: 1850000,
    displayPrice: "AED 1,850,000",
    location: "Jumeirah Village Circle",
    community: "Jumeirah Village Circle",
    city: "Dubai",
    address: "Jumeirah Village Circle, Dubai, UAE",
    type: "Off-Plan",
    status: "New Launch",
    featuredCategory: "Commercial",
    beds: 2,
    baths: 2,
    areaSqft: 1165,
    parking: 1,
    furnished: false,
    handover: "Q2 2028",
    project: {
      aboutTitle: "ABOUT CAPITAL ONE - JVC",
      projectName: "Capital One - JVC",
      developer: "Centurion Star Developers LLC",
      architect: "Datum Engineering Consultants",
      location: "Jumeirah Village Circle",
      plotNumber: "6816367",
      plotAreaSqft: 24219,
      estCompletion: "Q2 2028",
      towerHeight: "3B+G+5P+23+R",
      finishing: "Shell & Core",
      lobbyCeilingHeightMm: 4550,
      estimatedServiceCharges: "AED 15 per sqft",
      parkingAllocation: [
        "1 space for every 50 sqm of office space",
        "1 space for every 70 sqm of retail space",
      ],
      numberOfParking: 338,
      elevators: ["8 Office use", "1 Service use"],
      about:
        "Capital One at JVC offers exceptional commercial spaces and modern offices with panoramic urban views, world-class amenities, and seamless road connectivity across Dubai.",
      heroTitle: "Capital One - JVC",
      heroLocation: "Jumeirah Village Circle, Dubai",
      startingPrice: "AED 1,850,000",
      unitTypes: "Offices, Terraces, Retail",
      paymentPlan: "60/40 Payment Plan",
      handover: "Q2 2028",
    },
    images: ["/src/img/img1.jpg", "/src/img/dubai1.avif", "/src/img/pexels.avif"],
    agentId: 1,
    coordinates: { lat: 25.061, lng: 55.209 },
    listedAt: "2026-02-05",
  },
  {
    id: 2,
    mode: "Rent",
    title: "Modern Apartment Downtown",
    slug: "modern-apartment-downtown",
    price: 210000,
    displayPrice: "AED 210,000 / year",
    location: "Downtown Dubai",
    community: "Downtown",
    city: "Dubai",
    address: "Downtown Dubai, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Residential",
    beds: 2,
    baths: 2,
    areaSqft: 1280,
    parking: 1,
    furnished: false,
    handover: "Ready",
    yearBuilt: 2021,
    description:
      "A sleek downtown residence with open-plan living, skyline views, and direct access to lifestyle destinations. Ideal for professionals seeking connectivity and comfort.",
    highlights: ["High-floor layout", "Gym & pool access", "Concierge services"],
    features: ["Balcony", "Built-in Wardrobes", "Shared Gym", "Shared Pool"],
    images: ["/src/img/dubai1.avif", "/src/img/pexels.avif"],
    agentId: 2,
    coordinates: { lat: 25.1972, lng: 55.2744 },
    listedAt: "2026-01-18",
  },
  {
    id: 3,
    mode: "Buy",
    title: "Contemporary Villa with Private Beach Access",
    slug: "contemporary-villa-private-beach-access",
    price: 12500000,
    displayPrice: "AED 12,500,000",
    location: "Palm Jumeirah",
    community: "Palm Jumeirah",
    city: "Dubai",
    address: "Palm Jumeirah, Dubai, UAE",
    type: "Villa",
    status: "Available",
    featuredCategory: "Residential",
    beds: 6,
    baths: 7,
    areaSqft: 8900,
    parking: 3,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2018,
    description:
      "A refined waterfront villa designed for effortless indoor-outdoor living. Enjoy large entertaining zones, premium materials, and elevated privacy.",
    highlights: ["Waterfront living", "Entertainment terrace", "Designer kitchen"],
    features: ["Beach Access", "Private Pool", "BBQ Area", "Cinema Room"],
    images: ["/src/img/pexels.avif", "/src/img/dubai3.jpg", "/src/img/img5.jpg"],
    agentId: 3,
    coordinates: { lat: 25.1124, lng: 55.139 },
    listedAt: "2026-02-02",
  },
  {
    id: 4,
    mode: "Rent",
    title: "Downtown Residence with Burj Views",
    slug: "downtown-residence-burj-views",
    price: 320000,
    displayPrice: "AED 320,000 / year",
    location: "Downtown Dubai",
    community: "Downtown",
    city: "Dubai",
    address: "Downtown Dubai, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Residential",
    beds: 3,
    baths: 3,
    areaSqft: 1850,
    parking: 2,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2020,
    description:
      "A bright, service-led residence featuring panoramic skyline views, generous bedrooms, and a contemporary finishing palette.",
    highlights: ["Panoramic views", "Serviced building", "Prime location"],
    features: ["Balcony", "Concierge", "Shared Pool", "Shared Gym", "Security"],
    images: ["/src/img/dubai3.jpg", "/src/img/dubai1.avif"],
    agentId: 4,
    coordinates: { lat: 25.1972, lng: 55.2744 },
    listedAt: "2026-01-25",
  },
  {
    id: 5,
    mode: "Buy",
    title: "Designer Penthouse with Skyline Terrace",
    slug: "designer-penthouse-skyline-terrace",
    price: 6400000,
    displayPrice: "AED 6,400,000",
    location: "Dubai Marina",
    community: "Dubai Marina",
    city: "Dubai",
    address: "Dubai Marina, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Community",
    beds: 4,
    baths: 5,
    areaSqft: 3620,
    parking: 2,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2020,
    description:
      "A statement penthouse with double-height living, curated finishes, and a private terrace designed for entertaining above the city.",
    highlights: [
      "Private terrace with skyline views",
      "Double-height living & dining",
      "Premium appliances & bespoke joinery",
    ],
    features: [
      "Terrace",
      "Private Lift Lobby",
      "Smart Home",
      "Built-in Wardrobes",
      "Concierge",
      "Shared Gym",
      "Shared Pool",
    ],
    images: ["/src/img/img5.jpg", "/src/img/img6.jpg", "/src/img/img7.jpg"],
    agentId: 1,
    coordinates: { lat: 25.0806, lng: 55.1403 },
    listedAt: "2026-02-03",
  },
  {
    id: 6,
    mode: "Rent",
    title: "Serviced Residence in Business Bay",
    slug: "serviced-residence-business-bay",
    price: 220000,
    displayPrice: "AED 220,000 / year",
    location: "Business Bay",
    community: "Business Bay",
    city: "Dubai",
    address: "Business Bay, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Commercial",
    beds: 2,
    baths: 2,
    areaSqft: 1410,
    parking: 1,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2022,
    description:
      "A hotel-grade serviced home with elegant finishes, flexible living spaces, and seamless access to dining, retail, and waterfront promenades.",
    highlights: ["Serviced living", "Canal-side lifestyle", "Premium amenities"],
    features: ["Concierge", "Housekeeping", "Shared Gym", "Shared Pool", "Security"],
    images: ["/src/img/img6.jpg", "/src/img/img1.jpg"],
    agentId: 2,
    coordinates: { lat: 25.1867, lng: 55.2803 },
    listedAt: "2026-01-28",
  },
  {
    id: 7,
    mode: "Buy",
    title: "Golf View Villa in Dubai Hills Estate",
    slug: "golf-view-villa-dubai-hills-estate",
    price: 9800000,
    displayPrice: "AED 9,800,000",
    location: "Dubai Hills Estate",
    community: "Dubai Hills Estate",
    city: "Dubai",
    address: "Dubai Hills Estate, Dubai, UAE",
    type: "Villa",
    status: "Available",
    featuredCategory: "Community",
    beds: 5,
    baths: 6,
    areaSqft: 6100,
    parking: 2,
    furnished: false,
    handover: "Ready",
    yearBuilt: 2021,
    description:
      "A contemporary family villa overlooking green fairways, offering generous proportions, bright interiors, and refined outdoor living.",
    highlights: ["Golf course views", "Open-plan layout", "Family-friendly community"],
    features: ["Garden", "Maid’s Room", "Study", "Built-in Wardrobes", "Gated Community", "Security"],
    images: ["/src/img/img7.jpg", "/src/img/img4.jpg", "/src/img/img9.jpg"],
    agentId: 3,
    coordinates: { lat: 25.0952, lng: 55.2426 },
    listedAt: "2026-02-02",
  },
  {
    id: 8,
    mode: "Rent",
    title: "Beachfront Apartment with Resort Amenities",
    slug: "beachfront-apartment-resort-amenities",
    price: 285000,
    displayPrice: "AED 285,000 / year",
    location: "Palm Jumeirah",
    community: "Palm Jumeirah",
    city: "Dubai",
    address: "Palm Jumeirah, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Residential",
    beds: 3,
    baths: 4,
    areaSqft: 2100,
    parking: 2,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2019,
    description:
      "A refined beachfront residence delivering a resort lifestyle with direct access to shoreline experiences, dining, and wellness facilities.",
    highlights: ["Beach access", "Resort pool deck", "Flexible 3-bed layout"],
    features: ["Beach Access", "Balcony", "Concierge", "Shared Pool", "Shared Gym", "Security"],
    images: ["/src/img/img9.jpg", "/src/img/pexels.avif"],
    agentId: 4,
    coordinates: { lat: 25.1124, lng: 55.139 },
    listedAt: "2026-01-30",
  },
  {
    id: 9,
    mode: "Sell",
    title: "Luxury Family Villa in Arabian Ranches",
    slug: "sell-family-villa-arabian-ranches",
    price: 5200000,
    displayPrice: "AED 5,200,000",
    location: "Arabian Ranches",
    community: "Arabian Ranches",
    city: "Dubai",
    address: "Arabian Ranches, Dubai, UAE",
    type: "Villa",
    status: "Available",
    featuredCategory: "Residential",
    beds: 4,
    baths: 5,
    areaSqft: 4120,
    parking: 2,
    furnished: false,
    handover: "Ready",
    yearBuilt: 2016,
    description:
      "A well-maintained family villa with bright living spaces and a private garden. Ideal for end-users seeking a quiet, established community with excellent access to schools and retail.",
    highlights: ["Private garden", "Spacious family layout", "Quiet internal location"],
    features: ["Garden", "Maid’s Room", "Covered Parking", "Community Pool", "Security"],
    images: ["/src/img/img4.jpg", "/src/img/img7.jpg", "/src/img/dubai3.jpg"],
    agentId: 2,
    coordinates: { lat: 25.0416, lng: 55.2387 },
    listedAt: "2026-02-03",
  },
  {
    id: 10,
    mode: "Sell",
    title: "Marina View Apartment (High Floor)",
    slug: "sell-marina-view-apartment-high-floor",
    price: 2650000,
    displayPrice: "AED 2,650,000",
    location: "Dubai Marina",
    community: "Dubai Marina",
    city: "Dubai",
    address: "Dubai Marina, Dubai, UAE",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Residential",
    beds: 2,
    baths: 2,
    areaSqft: 1340,
    parking: 1,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2019,
    description:
      "A high-floor apartment with open views over the marina. Presented in turnkey condition with modern finishes and efficient layout.",
    highlights: ["High floor", "Marina views", "Move-in ready"],
    features: ["Balcony", "Built-in Wardrobes", "Shared Gym", "Shared Pool", "Concierge"],
    images: ["/src/img/img10.jpg", "/src/img/img5.jpg"],
    agentId: 1,
    coordinates: { lat: 25.0806, lng: 55.1403 },
    listedAt: "2026-02-02",
  },
  {
    id: 11,
    mode: "Buy",
    title: "Luxury Ultra-Penthouse Golf Course",
    slug: "luxury-ultra-penthouse-golf-course",
    price: 18500000,
    displayPrice: "₹4.07 Cr",
    location: "India",
    community: "Golf Course Road",
    city: "Delhi NCR",
    address: "Golf Course Road, Sector 54, Gurugram, India",
    type: "Apartment",
    status: "Available",
    featuredCategory: "Residential",
    beds: 4,
    baths: 5,
    areaSqft: 4800,
    parking: 3,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2023,
    description:
      "Prestigious sky mansion on Golf Course Road featuring panoramic greens, Italian marble interiors, smart home automation, and 5-star concierge services.",
    highlights: ["Panoramic Golf Views", "Private Elevator", "Triple Height Lobby"],
    features: ["Concierge", "Clubhouse", "Infinity Pool", "Private Terrace"],
    images: ["/src/img/img1.jpg", "/src/img/dubai3.jpg", "/src/img/img5.jpg"],
    agentId: 1,
    coordinates: { lat: 28.4357, lng: 77.1065 },
    listedAt: "2026-02-15",
  },
  {
    id: 12,
    mode: "Buy",
    title: "Signature Smart Mansion Tricity",
    slug: "signature-smart-mansion-tricity",
    price: 9500000,
    displayPrice: "₹2.09 Cr",
    location: "Tricity (Chandigarh • Panchkula • Mohali)",
    community: "Tricity Luxury Corridor",
    city: "Tricity",
    address: "VIP Road, Tricity Corridor (Chandigarh - Panchkula - Mohali), India",
    type: "Villa",
    status: "Available",
    featuredCategory: "Community",
    beds: 4,
    baths: 4,
    areaSqft: 4200,
    parking: 3,
    furnished: true,
    handover: "Ready",
    yearBuilt: 2024,
    description:
      "Contemporary luxury architectural villa in prime Tricity (Chandigarh • Panchkula • Mohali) featuring landscaped private lawns, smart home automation, heated lap pool, and seamless expressway connectivity.",
    highlights: ["Tricity Luxury Corridor", "Private Heated Pool", "Smart Automation", "Airport Expressway Access"],
    features: ["Private Pool", "Landscaped Garden", "24/7 Security", "Clubhouse"],
    images: ["/src/img/img7.jpg", "/src/img/img4.jpg", "/src/img/img10.jpg"],
    agentId: 2,
    coordinates: { lat: 30.7333, lng: 76.7794 },
    listedAt: "2026-02-12",
  },
  {
    id: 13,
    mode: "Buy",
    title: "Gated Eco Villa Silicon Palms",
    slug: "gated-eco-villa-silicon-palms",
    price: 8900000,
    displayPrice: "₹1.95 Cr",
    location: "India",
    community: "Indiranagar",
    city: "Bangalore",
    address: "100ft Road Corridor, Indiranagar, Bangalore, India",
    type: "Villa",
    status: "Available",
    featuredCategory: "Community",
    beds: 3,
    baths: 4,
    areaSqft: 3400,
    parking: 2,
    furnished: false,
    handover: "Ready",
    yearBuilt: 2024,
    description:
      "Modern architectural villa with private lap pool, landscaped private lawn, and seamless access to central business hubs and tech parks.",
    highlights: ["Private Pool", "Solar Powered", "Tech Hub Access"],
    features: ["Private Pool", "Garden", "Security", "Clubhouse"],
    images: ["/src/img/img4.jpg", "/src/img/img6.jpg", "/src/img/img10.jpg"],
    agentId: 2,
    coordinates: { lat: 12.9716, lng: 77.5946 },
    listedAt: "2026-02-10",
  },
];

let properties = seedProperties.map((p, idx) => ({
  ...p,
  _id: `prop_${p.id || idx + 1}`,
}));

let inquiries = [
  {
    _id: "inq_1",
    name: "Alexandre Laurent",
    email: "alexandre.l@monaco-invest.mc",
    phone: "+377 98 06 20 00",
    message:
      "Interested in the Contemporary Villa on Palm Jumeirah. Please share payment milestone details and arrange a private viewing.",
    propertySnapshot: {
      title: "Contemporary Villa with Private Beach Access",
    },
    status: "new",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    _id: "inq_2",
    name: "Dr. Rohini Mehta",
    email: "rohini.m@apollohealth.in",
    phone: "+91 98110 54321",
    message:
      "Looking for off-plan luxury penthouses in Downtown Dubai and Delhi NCR Golf Course Road for portfolio diversification.",
    propertySnapshot: {
      title: "Capital One - JVC",
    },
    status: "new",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    _id: "inq_3",
    name: "Hamdan Al Maktoum",
    email: "h.almaktoum@primecapital.ae",
    phone: "+971 50 123 4567",
    message:
      "Requesting full financial breakdown and estimated gross/net yields for Business Bay serviced suites.",
    propertySnapshot: {
      title: "Serviced Residence in Business Bay",
    },
    status: "read",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export function mockApiPlugin() {
  return {
    name: "mock-api-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
        const pathname = url.pathname;

        if (!pathname.startsWith("/api")) {
          return next();
        }

        // --- AUTH ---
        if (pathname === "/api/auth/login" && req.method === "POST") {
          const body = await parseBody(req);
          return sendJson(res, 200, {
            success: true,
            token: "ncr_admin_session_token_authenticated",
            user: {
              name: body.username || "Admin",
              email: "admin@ncrproperties.ae",
              role: "admin",
            },
          });
        }

        if (pathname === "/api/auth/me" && req.method === "GET") {
          return sendJson(res, 200, {
            success: true,
            user: {
              name: "Admin User",
              email: "admin@ncrproperties.ae",
              role: "admin",
            },
          });
        }

        // --- INQUIRIES ---
        if (pathname === "/api/inquiries" && req.method === "GET") {
          return sendJson(res, 200, inquiries);
        }

        if (pathname === "/api/inquiries" && req.method === "POST") {
          const body = await parseBody(req);
          const newInq = {
            _id: `inq_${Date.now()}`,
            name: body.name || body.fullName || "Prospective Client",
            email: body.email || "",
            phone: body.phone || "",
            message: body.message || `Interest in ${body.service || "property"}`,
            propertySnapshot: body.propertySnapshot || {
              title: body.propertyTitle || "Property Inquiry",
            },
            status: "new",
            createdAt: new Date().toISOString(),
          };
          inquiries.unshift(newInq);
          return sendJson(res, 201, { success: true, inquiry: newInq });
        }

        if (pathname.startsWith("/api/inquiries/") && req.method === "PATCH") {
          const id = pathname.replace("/api/inquiries/", "");
          const body = await parseBody(req);
          const inq = inquiries.find((i) => String(i._id) === String(id));
          if (inq) {
            Object.assign(inq, body);
            return sendJson(res, 200, { success: true, inquiry: inq });
          }
          return sendJson(res, 404, { message: "Inquiry not found" });
        }

        // --- PROPERTY DETAILS BY SLUG ---
        if (pathname.startsWith("/api/properties/by-slug/")) {
          const slug = decodeURIComponent(pathname.replace("/api/properties/by-slug/", ""));
          const prop = properties.find(
            (p) =>
              p.slug === slug ||
              (p.title &&
                p.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "") === slug)
          );
          if (prop) {
            return sendJson(res, 200, prop);
          }
          return sendJson(res, 404, { message: "Property not found" });
        }

        // --- PROPERTY DETAILS BY ID ---
        if (pathname.startsWith("/api/properties/by/")) {
          const id = decodeURIComponent(pathname.replace("/api/properties/by/", ""));
          const prop = properties.find(
            (p) => String(p.id) === String(id) || String(p._id) === String(id)
          );
          if (prop) {
            return sendJson(res, 200, prop);
          }
          return sendJson(res, 404, { message: "Property not found" });
        }

        // --- PROPERTIES COLLECTION & CRUD ---
        if (pathname === "/api/properties") {
          if (req.method === "GET") {
            const status = url.searchParams.get("status"); // Add status filter
            const moderationStatus = url.searchParams.get("moderationStatus");
            let result = [...properties];
        
            if (status) {
              result = result.filter((p) => p.status && p.status.toLowerCase() === status.toLowerCase());
            }
            if (moderationStatus) {
              result = result.filter((p) => p.moderationStatus && p.moderationStatus.toLowerCase() === moderationStatus.toLowerCase());
            }
        
            return sendJson(res, 200, result);
          }

          if (req.method === "POST") {
            const body = await parseBody(req);
            const newId = body.id || (properties.length ? Math.max(...properties.map(p => Number(p.id) || 0)) + 1 : 1);
            const newProp = {
              ...body,
              id: newId,
              _id: body._id || `prop_${newId}`,
              slug: body.slug || (body.title ? body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `property-${newId}`),
              status: body.status || "Available",
              listedAt: body.listedAt || new Date().toISOString().split("T")[0],
            };
            properties.unshift(newProp);
            return sendJson(res, 201, newProp);
          }
        }

        // Approval endpoint: /api/properties/:id/approve
        if (pathname.match(/^\/api\/properties\/[^/]+\/approve$/) && req.method === "POST") {
          const parts = pathname.split("/");
          const id = parts[3];
          const body = await parseBody(req);
          const prop = properties.find((p) => String(p._id) === String(id) || String(p.id) === String(id));
          if (prop) {
            prop.adminApproved = true;
            prop.status = "Available";
            prop.moderationStatus = "approved";
            if (body.brokingPercentage) prop.brokingPercentage = body.brokingPercentage;
            if (body.adminPlatformPct) prop.adminPlatformPct = body.adminPlatformPct;
            if (body.dealerCommissionPct) prop.dealerCommissionPct = body.dealerCommissionPct;
            if (body.checkerEscrowPct) prop.checkerEscrowPct = body.checkerEscrowPct;
            if (body.remarks) prop.adminRemarks = body.remarks;
            return sendJson(res, 200, { success: true, property: prop });
          }
          return sendJson(res, 404, { message: "Property not found" });
        }

        // Single property PUT/DELETE by ID (e.g. /api/properties/:id)
        if (pathname.startsWith("/api/properties/")) {
          const id = pathname.replace("/api/properties/", "");
          const index = properties.findIndex(
            (p) => String(p._id) === String(id) || String(p.id) === String(id)
          );

          if (req.method === "GET") {
            if (index !== -1) return sendJson(res, 200, properties[index]);
            return sendJson(res, 404, { message: "Property not found" });
          }

          if (req.method === "PUT" || req.method === "PATCH") {
            const body = await parseBody(req);
            if (index !== -1) {
              properties[index] = { ...properties[index], ...body };
              return sendJson(res, 200, properties[index]);
            }
            return sendJson(res, 404, { message: "Property not found" });
          }

          if (req.method === "DELETE") {
            if (index !== -1) {
              const deleted = properties.splice(index, 1);
              return sendJson(res, 200, { success: true, property: deleted[0] });
            }
            return sendJson(res, 404, { message: "Property not found" });
          }
        }

        // --- FILE UPLOAD MOCK ---
        if (pathname === "/api/upload" && req.method === "POST") {
          return sendJson(res, 200, {
            status: "success",
            filename: "property_preview.jpg",
            url: "/src/img/img1.jpg",
          });
        }

        // --- AI CHATBOT ---
        if (pathname === "/api/ai/chat" && req.method === "POST") {
          const body = await parseBody(req);
          const message = body.message || "";
          const history = Array.isArray(body.history) ? body.history : [];

          if (process.env.GEMINI_API_KEY) {
            try {
              const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY,
                httpOptions: {
                  headers: {
                    "User-Agent": "aistudio-build",
                  },
                },
              });

              const systemInstruction = `You are the Senior AI Real Estate & Investment Advisor for "NCR Properties", an elite luxury brokerage based on Sheikh Zayed Road, Dubai, with a dedicated cross-border NRI Advisory Desk for India.

Key Knowledge Base & Market Grounding:
1. Real-Time Dubai Land Department (DLD) Transaction Intelligence:
   - Downtown Dubai: Avg AED 2,850/sq.ft. Gross rental yield: 6.8% - 7.5%. Short-term holiday home premium: +28%. Latest sales: Act One | Act Two 2-bed AED 3.1M, Opera Grand 3-bed AED 6.45M, Mercedes-Benz Places AED 8.8M.
   - Dubai Marina: Avg AED 1,980/sq.ft. Gross rental yield: 7.2% - 7.8%. High occupancy (91%). Latest sales: Marina Gate Tower 1 2-bed AED 2.65M, Liv Waterside AED 1.68M.
   - Business Bay: Avg AED 2,150/sq.ft. Gross yield: 7.5% - 8.2%. Top off-plan: Canal Crown, Peninsula, The Opus.
   - Palm Jumeirah: Avg AED 4,200/sq.ft. Luxury villas AED 24M - 80M+. Gross rental yields 6.0% - 6.5%, capital appreciation +22% YoY.
   - Dubai Hills Estate: Avg AED 2,350/sq.ft. High tenant demand, top schools, family community. Gross yield: 6.8% - 7.3%.
   - Jumeirah Village Circle (JVC): Highest rental yields in Dubai (8.5% - 9.2% gross), high cash flow. Capital One at JVC starts at AED 1.85M.
   - Dubai Creek Harbour: Avg AED 2,200/sq.ft. Emaar master community, yields ~7.3%.

2. AI Rental Yield & ROI Calculation:
   - Gross Yield = (Annual Rental Income / Purchase Price) * 100
   - Net Yield = ((Annual Rental Income - Annual Service Charges - 5% Management - 0.3% Maintenance) / Total Acquisition Cost) * 100
   - Dubai Service Charges: Typically AED 12 - 24 per sq.ft. depending on building luxury tier.
   - Short-term holiday homes generate a 20-35% revenue premium over standard tenancy contracts in high-tourism hotspots (Downtown, Marina, Palm).

3. Legal & Regulatory Framework (DLD / RERA):
   - Dubai Land Department (DLD) transfer fee: 4% + AED 4,000 admin trustee fee.
   - Brokerage fee: 2% + 5% VAT.
   - UAE Golden Visa: Property investment of at least AED 2,000,000 (freehold, off-plan or ready) qualifies the buyer, spouse, children, and domestic staff for a 10-year renewable residency with 0% personal income and capital gains tax.
   - Financing: Non-resident foreigners can obtain mortgages up to 50-60% LTV; UAE residents up to 80% LTV.

4. NRI Desk 🇮🇳 (India Property Portfolio):
   - Delhi NCR (Gurgaon Golf Course Road, Cyber Hub, luxury sky mansions like DLF/M3M).
   - Tricity (Chandigarh • Panchkula • Mohali corridor, smart villas, high-speed airport road).
   - Bangalore (Indiranagar, Whitefield, tech corridor eco villas).
   - Full FEMA compliance, NRE/NRO banking repatriation guidance.

5. Featured New Off-Plan Launches (2026-2028):
   - Residential:
     • Mercedes by Binghatti (Downtown Dubai): 65-storey branded tower, private sky pools, acoustic lounges, starting AED 8.8M. Handover Q4 2026.
     • SOBHA Central (Sheikh Zayed Road / Downtown Corridor): Signature German precision finishes, skyline infinity pool, starting AED 2.85M. Handover Q4 2027.
     • Damac - Chelsea Residence (Dubai Maritime City / Al Safa): British heritage luxury waterfront residences, private marina access, starting AED 2.15M. Handover Q1 2028.
   - Commercial:
     • O1NE in Motor City: Grade-A futuristic commercial offices and collaborative retail pavilions, high yields (8.5%+), starting AED 1.65M. Handover Q3 2027.
     • Lumena by Omniyat (Marasi Bay Marina, Business Bay): Ultra-prime sculptural commercial tower, corporate HQs, canal-front executive boardrooms, private yacht berths, starting AED 3.2M. Handover Q2 2027.
     • Burj Capital by Centurion (Business Bay / Downtown): Institutional corporate tower for family offices & funds, starting AED 2.75M. Handover Q1 2028.
   - Community Living:
     • Modon - Wadeem Gardens (Hudayriyat Island, Abu Dhabi): Biophilic garden villas, organic greenery, cycling paths, nature trails, sports hubs, starting AED 4.4M. Handover Q4 2027.
     • Bayn- ORA (Sahel Al Emarat / Ghantoot): Serene coastal sanctuary by Naguib Sawiris's ORA, private swimmable beach access, tranquil lagoons, sports clubs, starting AED 3.85M. Handover Q2 2028.
     • Sobha City - Abu Dhabi (Al Siniya Island, Abu Dhabi): Island waterfront metropolis, natural mangrove lagoons, 18-hole championship golf links, starting AED 3.6M. Handover Q3 2028.

Tone & Style:
- Highly professional, analytical, concise, confident, and polite.
- When formatting text, use clean line breaks, standard bullet points (•), and avoid excessive bold asterisks (**) or markdown clumping so the response reads cleanly on mobile and desktop.
- When asked for calculations, provide clean breakdown figures (Price, Expected Rent, Service Charges, Net Yield, Golden Visa eligibility).
- Conclude key property inquiries with an invitation to connect directly with our licensed advisors via WhatsApp or phone.`;

              const contents = [];
              // Add conversation context if available
              for (const h of history.slice(-4)) {
                if (h.role && h.text) {
                  contents.push({
                    role: h.role === "assistant" ? "model" : "user",
                    parts: [{ text: h.text }],
                  });
                }
              }
              contents.push({
                role: "user",
                parts: [{ text: message }],
              });

              const response = await ai.models.generateContent({
                model: "gemini-3.8-flash",
                contents,
                config: {
                  systemInstruction,
                },
              });

              const reply =
                response.text ||
                "Thank you for contacting NCR Properties. How may our advisory team assist you today?";
              return sendJson(res, 200, { reply, message: reply });
            } catch (err) {
              console.warn(
                "Gemini API call failed, falling back to rule-based:",
                err?.message
              );
            }
          }

          const msg = message.toLowerCase();
          let reply =
            "Thank you for contacting NCR Properties. We specialize in prime Dubai and India properties, off-plan developer allocations, Golden Visa advisory, rental yield optimization, and portfolio management. How may our advisory team assist you today?";

          if (
            msg.includes("rent") ||
            msg.includes("yield") ||
            msg.includes("roi") ||
            msg.includes("calc")
          ) {
            reply =
              "📊 **Dubai Rental Yield Benchmarks**:\n\n• **Jumeirah Village Circle (JVC)**: 8.5% – 9.2% gross yield (highest cashflow)\n• **Business Bay**: 7.5% – 8.2% gross yield\n• **Dubai Marina**: 7.2% – 7.8% gross yield\n• **Downtown Dubai**: 6.8% – 7.4% gross yield (plus ~28% short-term holiday home premium)\n• **Palm Jumeirah**: 6.0% – 6.5% gross yield with superior capital appreciation (+22% YoY).\n\nYou can use our interactive Rental Calculator widget directly in the tab above to model your net income and DLD acquisition costs!";
          } else if (
            msg.includes("transaction") ||
            msg.includes("dld") ||
            msg.includes("price") ||
            msg.includes("market")
          ) {
            reply =
              "📈 **Real-Time Dubai Transaction Intelligence**:\n\n• **Downtown Dubai**: Avg AED 2,850/sq.ft. Recent notable sale: Act One | Act Two 2-bed at AED 3,100,000 (AED 2,540/sq.ft).\n• **Dubai Marina**: Avg AED 1,980/sq.ft. Recent sale: Marina Gate Tower 1 2-bed at AED 2,650,000.\n• **Palm Jumeirah**: Avg AED 4,200/sq.ft. Beachfront Signature villas trading between AED 45M – 80M+.\n• **Dubai Hills**: Avg AED 2,350/sq.ft. High family rental demand.\n\nAll transactions are verified against Dubai Land Department (DLD) open registry records.";
          } else if (msg.includes("visa") || msg.includes("golden")) {
            reply =
              "🇦🇪 **UAE Golden Visa (10-Year Residency)**:\n\n• **Threshold**: Property acquisition of **AED 2,000,000 or more** in designated freehold zones.\n• **Eligible Assets**: Ready properties or off-plan purchases from approved master developers (Emaar, Nakheel, Damac, Sobha, Binghatti).\n• **Benefits**: 100% foreign ownership, 0% capital gains & personal tax, sponsor spouse, children of any age, and domestic staff with no physical stay requirement to maintain validity.\n\nOur in-house legal desk handles end-to-end DLD title deeds and Golden Visa processing.";
          } else if (
            msg.includes("india") ||
            msg.includes("delhi") ||
            msg.includes("bangalore") ||
            msg.includes("tricity") ||
            msg.includes("nri")
          ) {
            reply =
              "🇮🇳 **NCR Properties NRI Advisory Desk**:\n\nWe provide overseas Indians and international investors turnkey acquisition, title verification, and portfolio management across:\n• **Delhi NCR**: Golf Course Road & Cyber City luxury sky mansions (₹4 Cr – ₹25 Cr)\n• **Tricity**: Chandigarh • Panchkula • Mohali luxury corridor & airport express villas (₹2 Cr – ₹8 Cr)\n• **Bangalore**: Indiranagar & Whitefield tech corridor eco villas (₹1.9 Cr – ₹6 Cr)\n\nWe provide full FEMA compliance, NRE/NRO repatriable banking support, and local tenancy management.";
          } else if (
            msg.includes("launch") ||
            msg.includes("new project") ||
            msg.includes("mercedes") ||
            msg.includes("chelsea") ||
            msg.includes("lumena") ||
            msg.includes("wadeem") ||
            msg.includes("bayn") ||
            msg.includes("o1ne")
          ) {
            reply =
              "🌟 **Latest UAE New Launch Portfolio**:\n\n**Residential**:\n• **Mercedes by Binghatti** (Downtown Dubai) — 65-storey branded tower, private sky pools (AED 8.8M+)\n• **SOBHA Central** (Sheikh Zayed Road / Downtown Corridor) — Signature German precision, infinity pool (AED 2.85M+)\n• **Damac - Chelsea Residence** (Maritime City / Al Safa) — British waterfront elegance, marina views (AED 2.15M+)\n\n**Commercial**:\n• **O1NE in Motor City** — Grade-A futuristic commercial offices (AED 1.65M+)\n• **Lumena by Omniyat** (Marasi Bay Marina) — Ultra-prime sculptural commercial tower (AED 3.2M+)\n• **Burj Capital by Centurion** (Business Bay) — Institutional corporate headquarters (AED 2.75M+)\n\n**Community Living**:\n• **Modon - Wadeem Gardens** (Hudayriyat Island, Abu Dhabi) — Biophilic garden villas (AED 4.4M+)\n• **Bayn- ORA** (Ghantoot Coastal Sanctuary) — Coastal sanctuary by ORA (AED 3.85M+)\n• **Sobha City - Abu Dhabi** (Al Siniya Island) — Waterfront island metropolis & golf (AED 3.6M+)\n\nWould you like full brochures, payment milestone plans, or unit layouts for any of these developments?";
          }

          return sendJson(res, 200, { reply, message: reply });
        }

        return sendJson(res, 404, { error: "API endpoint not found" });
      });
    },
  };
}
