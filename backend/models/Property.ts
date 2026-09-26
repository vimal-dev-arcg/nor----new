import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  id: number;
  _id: any;
  mode: string;
  title: string;
  slug: string;
  price?: number;
  displayPrice?: string;
  location?: string;
  community?: string;
  city?: string;
  address?: string;
  type?: string;
  status?: string;
  featuredCategory?: string;
  category?: string;
  beds?: any;
  baths?: any;
  areaSqft?: any;
  parking?: number;
  furnished?: boolean;
  handover?: string;
  yearBuilt?: number;
  description?: string;
  subtitle?: string;
  highlights?: string[];
  features?: string[];
  amenities?: string[];
  images?: string[];
  floorPlans?: any[];
  project?: any;
  agentId?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  listedAt?: string;
  moderationStatus?: string;
  adminApproved?: boolean;
  brokingPercentage?: number;
  adminPlatformPct?: number;
  dealerCommissionPct?: number;
  checkerEscrowPct?: number;
  adminRemarks?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    id: { type: Number, index: true },
    mode: { type: String, default: "Buy" },
    title: { type: String, required: true },
    slug: { type: String, required: true, index: true },
    price: { type: Number, default: 0 },
    displayPrice: { type: String, default: "" },
    location: { type: String, default: "" },
    community: { type: String, default: "" },
    city: { type: String, default: "Dubai" },
    address: { type: String, default: "" },
    type: { type: String, default: "Apartment" },
    status: { type: String, default: "Available", index: true },
    featuredCategory: { type: String, default: "" },
    category: { type: String, default: "residential" },
    beds: { type: Schema.Types.Mixed, default: 1 },
    baths: { type: Schema.Types.Mixed, default: 1 },
    areaSqft: { type: Schema.Types.Mixed, default: 0 },
    parking: { type: Number, default: 1 },
    furnished: { type: Boolean, default: false },
    handover: { type: String, default: "Ready" },
    yearBuilt: { type: Number },
    description: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    highlights: { type: [String], default: [] },
    features: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    floorPlans: { type: [Schema.Types.Mixed], default: [] },
    project: { type: Schema.Types.Mixed, default: {} },
    agentId: { type: Number, default: 1 },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    listedAt: { type: String },
    moderationStatus: { type: String, default: "approved", index: true },
    adminApproved: { type: Boolean, default: true },
    brokingPercentage: { type: Number },
    adminPlatformPct: { type: Number },
    dealerCommissionPct: { type: Number },
    checkerEscrowPct: { type: Number },
    adminRemarks: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Search text index on title, location, and description
PropertySchema.index({ title: "text", location: "text", description: "text" });

export const PropertyModel =
  mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
