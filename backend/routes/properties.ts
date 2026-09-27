import { Router, Request, Response } from "express";
import { loadProperties, saveProperties } from "../storage";
import { initialProperties } from "../data/seedData";
import { PropertyModel } from "../models/Property";
import { isMongoConnected } from "../db";
import { optionalAuth, AuthRequest } from "../middleware/auth";

export const propertiesRouter = Router();

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
      if (Array.isArray(mongoProps) && mongoProps.length > 0) {
        return res.status(200).json(mongoProps);
      }
    } catch (err) {
      console.warn("[MongoDB] Notice querying properties, falling back to local dataset:", err);
    }
  }

  // File-storage fallback when MongoDB is offline or empty (never throws 500)
  const currentProperties = loadProperties(initialProperties);
  let result = [...currentProperties];

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
      const prop = await PropertyModel.findOne({ slug }).lean();
      if (prop) return res.status(200).json(prop);
    } catch (err) {
      console.warn("[MongoDB] Error finding property by slug:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const prop = currentProperties.find((p) => p.slug === slug);
  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// GET /api/properties/by/:id
propertiesRouter.get("/by/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const prop = await PropertyModel.findOne({ $or: queryOr }).lean();
      if (prop) return res.status(200).json(prop);
    } catch (err) {
      console.warn("[MongoDB] Error finding property by ID:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const prop = currentProperties.find(
    (p) => String(p.id) === String(id) || String(p._id) === String(id)
  );

  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// POST /api/properties (Create property)
propertiesRouter.post("/", optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body || {};
    const currentProperties = loadProperties(initialProperties);
    const maxId = currentProperties.reduce((max: number, p: any) => Math.max(max, Number(p.id) || 0), 0);
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

    let createdDoc: any = null;
    // Persist directly to MongoDB if connected
    if (isMongoConnected()) {
      try {
        createdDoc = await PropertyModel.create(newPropData);
        console.log(`[MongoDB] Property successfully created with _id: ${createdDoc._id}`);
      } catch (err: any) {
        console.warn("[MongoDB] Error creating property:", err?.message);
      }
    }

    const fileProp = {
      ...newPropData,
      _id: createdDoc?._id ? String(createdDoc._id) : (body._id || `prop_${newId}`)
    };
    currentProperties.unshift(fileProp);
    saveProperties(currentProperties);

    return res.status(201).json(createdDoc || fileProp);
  } catch (err: any) {
    console.error("Error creating property:", err);
    return res.status(500).json({ error: err?.message || "Failed to create property" });
  }
});

// POST /api/properties/:id/approve
propertiesRouter.post("/:id/approve", optionalAuth, async (req: AuthRequest, res: Response) => {
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
    } catch (err) {
      console.warn("[MongoDB] Error approving property:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const prop = currentProperties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    Object.assign(prop, updates);
    saveProperties(currentProperties);
    return res.status(200).json({ success: true, property: prop });
  }

  return res.status(404).json({ message: "Property not found" });
});

// POST /api/properties/:id/draft
propertiesRouter.post("/:id/draft", optionalAuth, async (req: AuthRequest, res: Response) => {
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
    } catch (err) {
      console.warn("[MongoDB] Error moving property to draft:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const prop = currentProperties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    prop.moderationStatus = "draft";
    saveProperties(currentProperties);
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
    } catch (err) {
      console.warn("[MongoDB] Error getting property:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const prop = currentProperties.find(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (prop) {
    return res.status(200).json(prop);
  }
  return res.status(404).json({ message: "Property not found" });
});

// PUT /api/properties/:id
propertiesRouter.put("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
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
    } catch (err) {
      console.warn("[MongoDB] Error updating property:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const index = currentProperties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    currentProperties[index] = { ...currentProperties[index], ...req.body };
    saveProperties(currentProperties);
    return res.status(200).json(currentProperties[index]);
  }

  return res.status(404).json({ message: "Property not found" });
});

// PATCH /api/properties/:id
propertiesRouter.patch("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
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
    } catch (err) {
      console.warn("[MongoDB] Error patching property:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const index = currentProperties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    currentProperties[index] = { ...currentProperties[index], ...req.body };
    saveProperties(currentProperties);
    return res.status(200).json(currentProperties[index]);
  }

  return res.status(404).json({ message: "Property not found" });
});

// DELETE /api/properties/:id
propertiesRouter.delete("/:id", optionalAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (isMongoConnected()) {
    try {
      const queryOr: any[] = [{ _id: id }];
      if (!isNaN(Number(id))) queryOr.push({ id: Number(id) });

      const deleted = await PropertyModel.findOneAndDelete({ $or: queryOr }).lean();
      if (deleted) {
        return res.status(200).json({ success: true, message: "Property deleted", property: deleted });
      }
    } catch (err) {
      console.warn("[MongoDB] Error deleting property:", err);
    }
  }

  const currentProperties = loadProperties(initialProperties);
  const index = currentProperties.findIndex(
    (p) => String(p._id) === String(id) || String(p.id) === String(id)
  );

  if (index !== -1) {
    const deleted = currentProperties.splice(index, 1);
    saveProperties(currentProperties);
    return res.status(200).json({ success: true, message: "Property deleted", property: deleted[0] });
  }

  return res.status(404).json({ message: "Property not found" });
});
