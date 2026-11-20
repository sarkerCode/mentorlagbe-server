import { ObjectId } from "mongodb";
import { getDB } from "../../config/database.js";

const toQueryId = (id) => {
  if (ObjectId.isValid(id)) {
    return { $in: [new ObjectId(id), String(id)] };
  }
  return String(id);
};

export const tuitionService = {
  // Get 6 latest approved and active tuitions for home page
  async getFeaturedTuitions() {
    const db = getDB();
    return await db
      .collection("tuition")
      .find({ approvalStatus: "approved", isActive: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();
  },

  // Get paginated tuitions with search & filters (Browse page)
  async getAllTuitions({
    search = "",
    subject = "",
    classLevel = "",
    mode = "",
    page = 1,
    limit = 9,
  } = {}) {
    const db = getDB();
    const query = {
      approvalStatus: "approved",
      isActive: true,
    };

    // Text search on title or subject
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { subject: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
      ];
    }

    if (subject && subject !== "all") {
      query.subject = { $regex: `^${subject.trim()}$`, $options: "i" };
    }

    if (classLevel && classLevel !== "all") {
      query.classLevel = classLevel;
    }

    if (mode && mode !== "all") {
      query.mode = mode;
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.max(1, Number(limit) || 9);
    const skip = (currentPage - 1) * pageLimit;

    const [items, total] = await Promise.all([
      db
        .collection("tuition")
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .toArray(),
      db.collection("tuition").countDocuments(query),
    ]);

    return {
      tuitions: items,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    };
  },

  // Get single tuition by ID
  async getTuitionById(id) {
    const db = getDB();
    return await db.collection("tuition").findOne({ _id: toQueryId(id) });
  },

  // Tutor creates a new tuition (enforcing Free max 2 tier rule)
  async createTuition(user, data) {
    const db = getDB();

    // Check user subscription plan
    const userDoc = await db.collection("user").findOne({
      $or: [{ _id: toQueryId(user.id) }, { email: user.email }],
    });

    const isPro = userDoc?.plan === "pro";

    if (!isPro) {
      const activePostCount = await db
        .collection("tuition")
        .countDocuments({ tutorEmail: user.email });

      if (activePostCount >= 2) {
        throw new Error(
          "Free Plan Tutors can create up to 2 tuition posts. Please upgrade to Pro for unlimited posts."
        );
      }
    }

    const newTuition = {
      title: data.title.trim(),
      subject: data.subject.trim(),
      classLevel: data.classLevel,
      mode: data.mode, // 'Online' | 'Offline'
      location: data.location.trim(),
      monthlyFee: Number(data.monthlyFee),
      daysPerWeek: Number(data.daysPerWeek),
      bannerImage:
        data.bannerImage ||
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
      description: data.description.trim(),
      tutorId: String(user.id),
      tutorName: userDoc?.name || user.name || "Verified Tutor",
      tutorEmail: user.email,
      approvalStatus: "pending",
      isActive: true,
      createdAt: new Date(),
    };

    const result = await db.collection("tuition").insertOne(newTuition);
    return { ...newTuition, _id: result.insertedId };
  },

  // Get all tuitions posted by a specific tutor
  async getMyTuitions(tutorEmail) {
    const db = getDB();
    return await db
      .collection("tuition")
      .find({ tutorEmail })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Tutor updates their tuition
  async updateTuition(id, tutorEmail, updateData) {
    const db = getDB();
    const query = {
      _id: toQueryId(id),
      tutorEmail,
    };

    const allowed = [
      "title",
      "subject",
      "classLevel",
      "mode",
      "location",
      "monthlyFee",
      "daysPerWeek",
      "bannerImage",
      "description",
    ];

    const fields = {};
    for (const key of allowed) {
      if (updateData[key] !== undefined) {
        fields[key] =
          key === "monthlyFee" || key === "daysPerWeek"
            ? Number(updateData[key])
            : updateData[key];
      }
    }
    fields.updatedAt = new Date();

    return await db.collection("tuition").findOneAndUpdate(
      query,
      { $set: fields },
      { returnDocument: "after" }
    );
  },

  // Tutor deletes their tuition
  async deleteTuition(id, tutorEmail) {
    const db = getDB();
    const query = {
      _id: toQueryId(id),
      tutorEmail,
    };
    return await db.collection("tuition").deleteOne(query);
  },

  // Tutor toggles active/closed status
  async toggleTuitionStatus(id, tutorEmail) {
    const db = getDB();
    const query = {
      _id: toQueryId(id),
      tutorEmail,
    };

    const tuition = await db.collection("tuition").findOne(query);
    if (!tuition) return null;

    const newStatus = !tuition.isActive;
    return await db.collection("tuition").findOneAndUpdate(
      query,
      { $set: { isActive: newStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  },

  // Admin gets all tuitions (including pending/rejected)
  async getAdminTuitions() {
    const db = getDB();
    return await db
      .collection("tuition")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Admin approves or rejects tuition
  async moderateTuition(id, approvalStatus) {
    const db = getDB();
    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      throw new Error("Invalid approvalStatus.");
    }

    return await db.collection("tuition").findOneAndUpdate(
      { _id: toQueryId(id) },
      { $set: { approvalStatus, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  },
};
