import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertySnapshot?: {
    title?: string;
    price?: any;
    location?: string;
  };
  status: string;
  service?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    message: { type: String, default: "" },
    propertySnapshot: {
      title: { type: String, default: "General Inquiry" },
      price: { type: Schema.Types.Mixed },
      location: { type: String },
    },
    status: { type: String, default: "new", index: true },
    service: { type: String, default: "Property Advisory" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const InquiryModel =
  mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
