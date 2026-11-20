import { ObjectId } from "mongodb";
import { getDB } from "../../config/database.js";

const toQueryId = (id) => {
  if (ObjectId.isValid(id)) {
    return { $in: [new ObjectId(id), String(id)] };
  }
  return String(id);
};

export const applicationService = {
  // Student submits application for a tuition
  async createApplication(studentUser, data) {
    const db = getDB();

    if (!data.tuitionId) {
      throw new Error("tuitionId is required.");
    }

    // 1. Fetch tuition details
    const tuition = await db
      .collection("tuition")
      .findOne({ _id: toQueryId(data.tuitionId) });

    if (!tuition) {
      throw new Error("Tuition post not found.");
    }

    if (!tuition.isActive || tuition.approvalStatus !== "approved") {
      throw new Error("This tuition is currently not accepting applications.");
    }

    // 2. Prevent duplicate application from same student for same tuition
    const existingApplication = await db.collection("application").findOne({
      tuitionId: tuition._id.toString(),
      studentEmail: studentUser.email,
    });

    if (existingApplication) {
      throw new Error("You have already submitted an application for this tuition.");
    }

    // 3. Create application document
    const newApp = {
      tuitionId: tuition._id.toString(),
      tuitionTitle: tuition.title,
      subject: tuition.subject,
      monthlyFee: tuition.monthlyFee,
      tutorEmail: tuition.tutorEmail,
      studentId: String(studentUser.id),
      studentName: studentUser.name || "Student",
      studentEmail: studentUser.email,
      studentPhone: data.studentPhone || "",
      preferredSchedule: data.preferredSchedule || "Flexible",
      studentNote: data.studentNote || "",
      status: "pending",
      appliedAt: new Date(),
    };

    const result = await db.collection("application").insertOne(newApp);
    return { ...newApp, _id: result.insertedId };
  },

  // Student gets their submitted applications
  async getMyApplications(studentEmail) {
    const db = getDB();
    return await db
      .collection("application")
      .find({ studentEmail })
      .sort({ appliedAt: -1 })
      .toArray();
  },

  // Student cancels/deletes pending application
  async cancelApplication(applicationId, studentEmail) {
    const db = getDB();
    const query = {
      _id: toQueryId(applicationId),
      studentEmail,
      status: "pending", // Only pending can be cancelled
    };

    return await db.collection("application").deleteOne(query);
  },

  // Tutor gets all incoming applicants for their tuition posts
  async getTutorApplicants(tutorEmail) {
    const db = getDB();
    return await db
      .collection("application")
      .find({ tutorEmail })
      .sort({ appliedAt: -1 })
      .toArray();
  },

  // Tutor updates application status to 'accepted' or 'rejected'
  async updateStatus(applicationId, tutorEmail, status) {
    const db = getDB();
    if (!["accepted", "rejected", "pending"].includes(status)) {
      throw new Error("Status must be 'accepted' or 'rejected'.");
    }

    const query = {
      _id: toQueryId(applicationId),
      tutorEmail,
    };

    return await db.collection("application").findOneAndUpdate(
      query,
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
  },
};
