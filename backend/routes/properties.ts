import { Router, Request, Response } from "express";
import { loadProperties, saveProperties } from "../storage";
import { initialProperties } from "../data/seedData";
import { PropertyModel } from "../models/Property";
import { isMongoConnected } from "../db";

export const propertiesRouter = Router();

// In-memory cache synced with persistent JSON store (starts empty)
let properties = loadProperties(initialProperties);

function slugify(input: string): string {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/properties (Filtered listing)
propertiesRouter.get("/", async (req: Request, res: Response) => {
  const { status, moderationStatus, location, mode, type, search } = req.query as Record<string, string>;

  if (isMongoConnected()) {
    try {
      const query: any = {};

      if (status) {
        query.status = { $regex: new RegExp(`^${status}$`, "i") };
      }

      if (moderationStatus) {
        query.moderationStatus = { $regex: new RegExp(`^${moderationStatus}$`, "i") };
      }

      if (location) {
        query.$or = [
          { location: { $regex: location, $options: "i" } },
          { city: { $regex: location, $options: "i" } },
          { community: { $regex: location, $options: "i" } },
        ];
      }

      if (mode) {
        query.mode = { $regex: new RegExp(`^${mode}$`, "i") };
      }

      if (type) {
        query.type = { $regex: new RegExp(`^${type}$`, "i") };
      }

      if (search) {
        const sRegex = { $regex: search, $options: "i" };
        query.$or = [
          { title: sRegex },
          { location: sRegex },
          { "project.projectName": sRegex },
          { "project.developer": sRegex },
        ];
      }

      const mongoProps = await PropertyModel.find(query).sort({ createdAt: -1 }).lean();
      return res.status(200).json(mongoProps || []);
    } catch (err) {
      console.error("[MongoDB] Error querying properties:", err);
      return res.status(500).json({ error: "Failed to query MongoDB properties" });
    }
  }

  // File-storage fallback when MongoDB is offline
  let result = [...properties];

  if (status) {
    result = result.filter(
      (p) => p.status && p.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (moderationStatus) {
    result = result.filter(
      (p) =>
        p.moderationStatus &&
        p.moderationStatus.toLowerCase() === moderationStatus.toLowerCase()
    );
  }

  if (location) {
    const locLower = location.toLowerCase();
    result = result.filter(
      (p) =>
        (p.location && p.location.toLowerCase().includes(locLower)) ||
        (p.city && p.city.toLowerCase().includes(locLower)) ||
        (p.community && p.community.toLowerCase().includes(locLower))
    );
  }

  if (mode) {
    result = result.filter(
      (p) => p.mode && p.mode.toLowerCase() === mode.toLowerCase()
    );
  }

  if (type) {
    result = result.filter(
      (p) => p.type && p.type.toLowerCase() === type.toLowerCase()
    );
  }

  if (search) {
    const qLower = search.toLowerCase();
    result = result.filter(
      (p) =>
        (p.title && p.title.toLowerCase().includes(qLower)) ||
        (p.location && p.location.toLowerCase().includes(qLower)) ||
        (p.project?.projectName && p.project.projectName.toLowerCase().includes(qLower)) ||
        (p.project?.developer && p.project.developer.toLowerCase().includes(qLower))
    );
  }

  return res.status(200).json(result);
});

// GET /api/properties/kyc-queue
propertiesRouter.get("/kyc-queue", async (_req: Request, res: Response) => {
  return res.status(200).json([]);
});

// GET /api/properties/escrow-ledger
propertiesRouter.get("/escrow-ledger", async (_req: Request, res: Response) => {
  return res.status(200).json([]);
});

// GET /api/properties/by-slug/:slug
propertiesRouter.get("/by-slug/:slug", async (req: Request, res: Response) => {
  const slug = decodeURIComponent(req.params.slug);

  if (isMongoConnected()) {
    try {
      const prop = await PropertyModel.findOne({
        $or: [{ slug }, { "project.projectName": slug }],
      }).lean();
      if (prop) return res.status(200).json(prop);
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error finding property by slug:", err);
      return res.status(500).json({ error: "Failed to find property by slug" });
    }
  }

  const prop = properties.find(
    (p) =>
      p.slug === slug ||
      slugify(p.title) === slugify(slug) ||
      slugify(p.project?.projectName || "") === slugify(slug)
  );

  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// GET /api/properties/by/:id
propertiesRouter.get("/by/:id", async (req: Request, res: Response) => {
  const id = decodeURIComponent(req.params.id);

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const prop = await PropertyModel.findOne({ $or: queryOr }).lean();
      if (prop) return res.status(200).json(prop);
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error finding property by ID:", err);
      return res.status(500).json({ error: "Failed to find property by ID" });
    }
  }

  const prop = properties.find(
    (p) => String(p.id) === String(id) || String(p._id) === String(id)
  );

  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// POST /api/properties (Create property)
propertiesRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body || {};
  const maxId = properties.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  const newId = body.id || (maxId > 0 ? maxId + 1 : Date.now());

  const newPropData = {
    ...body,
    id: newId,
    slug: body.slug || slugify(body.title || `property-${newId}`),
    status: body.status || "Available",
    moderationStatus: body.moderationStatus || "approved",
    listedAt: body.listedAt || new Date().toISOString().split("T")[0],
    images: Array.isArray(body.images) && body.images.length ? body.images : ["/src/img/img1.jpg"],
  };

  // Persist directly to MongoDB if connected
  if (isMongoConnected()) {
    try {
      const created = await PropertyModel.create(newPropData);
      console.log(`[MongoDB] Property successfully created with _id: ${created._id}`);
      return res.status(201).json(created);
    } catch (err: any) {
      console.error("[MongoDB] Error creating property:", err);
      return res.status(500).json({ error: err?.message || "Failed to save property to MongoDB" });
    }
  }

  const fileProp = { ...newPropData, _id: body._id || `prop_${newId}` };
  properties.unshift(fileProp);
  saveProperties(properties);

  return res.status(201).json(fileProp);
});

// POST /api/properties/:id/approve
propertiesRouter.post("/:id/approve", async (req: Request, res: Response) => {
  const { id } = req.params;
  const body = req.body || {};

  const updates: any = {
    adminApproved: true,
    status: "Available",
    moderationStatus: "approved",
  };
  if (body.brokingPercentage) updates.brokingPercentage = body.brokingPercentage;
  if (body.adminPlatformPct) updates.adminPlatformPct = body.adminPlatformPct;
  if (body.dealerCommissionPct) updates.dealerCommissionPct = body.dealerCommissionPct;
  if (body.checkerEscrowPct) updates.checkerEscrowPct = body.checkerEscrowPct;
  if (body.remarks) updates.adminRemarks = body.remarks;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const updated = await PropertyModel.findOneAndUpdate(
        { $or: queryOr },
        { $set: updates },
        { new: true }
      ).lean();

      if (updated) {
        return res.status(200).json({ success: true, property: updated });
      }
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error approving property:", err);
      return res.status(500).json({ error: "Failed to approve property in MongoDB" });
    }
  }

  const prop = properties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    Object.assign(prop, updates);
    saveProperties(properties);
    return res.status(200).json({ success: true, property: prop });
  }

  return res.status(404).json({ message: "Property not found" });
});

// POST /api/properties/:id/draft
propertiesRouter.post("/:id/draft", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const updated = await PropertyModel.findOneAndUpdate(
        { $or: queryOr },
        { $set: { moderationStatus: "draft" } },
        { new: true }
      ).lean();

      if (updated) {
        return res.status(200).json({ success: true, property: updated });
      }
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error moving property to draft:", err);
      return res.status(500).json({ error: "Failed to update property status" });
    }
  }

  const prop = properties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    prop.moderationStatus = "draft";
    saveProperties(properties);
    return res.status(200).json({ success: true, property: prop });
  }

  return res.status(404).json({ message: "Property not found" });
});

// GET /api/properties/:id
propertiesRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const prop = await PropertyModel.findOne({ $or: queryOr }).lean();
      if (prop) return res.status(200).json(prop);
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error getting property:", err);
      return res.status(500).json({ error: "Failed to fetch property from MongoDB" });
    }
  }

  const prop = properties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// PUT /api/properties/:id
propertiesRouter.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const updated = await PropertyModel.findOneAndUpdate(
        { $or: queryOr },
        { $set: req.body },
        { new: true }
      ).lean();

      if (updated) {
        return res.status(200).json(updated);
      }
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error updating property:", err);
      return res.status(500).json({ error: "Failed to update property in MongoDB" });
    }
  }

  const index = properties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    properties[index] = { ...properties[index], ...req.body };
    saveProperties(properties);
    return res.status(200).json(properties[index]);
  }

  return res.status(404).json({ message: "Property not found" });
});

// PATCH /api/properties/:id
propertiesRouter.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const updated = await PropertyModel.findOneAndUpdate(
        { $or: queryOr },
        { $set: req.body },
        { new: true }
      ).lean();

      if (updated) {
        return res.status(200).json(updated);
      }
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error patching property:", err);
      return res.status(500).json({ error: "Failed to patch property in MongoDB" });
    }
  }

  const index = properties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    properties[index] = { ...properties[index], ...req.body };
    saveProperties(properties);
    return res.status(200).json(properties[index]);
  }

  return res.status(404).json({ message: "Property not found" });
});

// DELETE /api/properties/:id
propertiesRouter.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const deleted = await PropertyModel.findOneAndDelete({ $or: queryOr }).lean();

      if (deleted) {
        return res.status(200).json({ success: true, property: deleted });
      }
      return res.status(404).json({ message: "Property not found" });
    } catch (err) {
      console.error("[MongoDB] Error deleting property:", err);
      return res.status(500).json({ error: "Failed to delete property from MongoDB" });
    }
  }

  const index = properties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    const deleted = properties.splice(index, 1);
    saveProperties(properties);
    return res.status(200).json({ success: true, property: deleted[0] });
  }

  return res.status(404).json({ message: "Property not found" });
});
