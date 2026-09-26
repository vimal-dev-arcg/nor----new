import { Router, Request, Response } from "express";
import { loadInquiries, saveInquiries } from "../storage";
import { initialInquiries } from "../data/seedData";
import { InquiryModel } from "../models/Inquiry";
import { isMongoConnected } from "../db";

export const inquiriesRouter = Router();

let inquiries = loadInquiries(initialInquiries);

// GET /api/inquiries
inquiriesRouter.get("/", async (_req: Request, res: Response) => {
  if (isMongoConnected()) {
    try {
      const mongoInqs = await InquiryModel.find().sort({ createdAt: -1 }).lean();
      return res.status(200).json(mongoInqs || []);
    } catch (err) {
      console.error("[MongoDB] Error querying inquiries:", err);
      return res.status(500).json({ error: "Failed to query inquiries from MongoDB" });
    }
  }

  return res.status(200).json(inquiries);
});

// POST /api/inquiries
inquiriesRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body || {};

  const inqData = {
    name: body.name || body.fullName || "Prospective Client",
    email: body.email || "",
    phone: body.phone || "",
    message: body.message || `Interest in ${body.service || "luxury property"}`,
    propertySnapshot: body.propertySnapshot || {
      title: body.propertyTitle || "Direct Portal Inquiry",
    },
    status: "new",
    service: body.service || "Property Advisory",
  };

  if (isMongoConnected()) {
    try {
      const created = await InquiryModel.create(inqData);
      console.log(`[MongoDB] Inquiry saved with _id: ${created._id}`);
      return res.status(201).json({ success: true, inquiry: created });
    } catch (err: any) {
      console.error("[MongoDB] Error saving inquiry to MongoDB:", err);
      return res.status(500).json({ error: "Failed to save inquiry to MongoDB" });
    }
  }

  const newInq = {
    _id: `inq_${Date.now()}`,
    ...inqData,
    createdAt: new Date().toISOString(),
  };

  inquiries.unshift(newInq);
  saveInquiries(inquiries);

  return res.status(201).json({ success: true, inquiry: newInq });
});

// PATCH /api/inquiries/:id
inquiriesRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const updated = await InquiryModel.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true }
      ).lean();
      if (updated) {
        return res.status(200).json({ success: true, inquiry: updated });
      }
      return res.status(404).json({ message: "Inquiry not found" });
    } catch (err) {
      console.error("[MongoDB] Error patching inquiry:", err);
      return res.status(500).json({ error: "Failed to update inquiry in MongoDB" });
    }
  }

  const inq = inquiries.find((i) => String(i._id) === String(id));

  if (inq) {
    Object.assign(inq, req.body);
    saveInquiries(inquiries);
    return res.status(200).json({ success: true, inquiry: inq });
  }

  return res.status(404).json({ message: "Inquiry not found" });
});

// DELETE /api/inquiries/:id
inquiriesRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const deleted = await InquiryModel.findByIdAndDelete(id).lean();
      if (deleted) {
        return res.status(200).json({ success: true, inquiry: deleted });
      }
      return res.status(404).json({ message: "Inquiry not found" });
    } catch (err) {
      console.error("[MongoDB] Error deleting inquiry:", err);
      return res.status(500).json({ error: "Failed to delete inquiry from MongoDB" });
    }
  }

  const index = inquiries.findIndex((i) => String(i._id) === String(id));

  if (index !== -1) {
    const deleted = inquiries.splice(index, 1);
    saveInquiries(inquiries);
    return res.status(200).json({ success: true, inquiry: deleted[0] });
  }

  return res.status(404).json({ message: "Inquiry not found" });
});
