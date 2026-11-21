import { getDB } from "../../config/database.js";

export const dashboardService = {
  // Aggregate Admin Metrics across all 4 singular collections
  async getAdminStats() {
    const db = getDB();

    const [
      totalUsers,
      totalStudents,
      totalTutors,
      totalTuitions,
      approvedTuitions,
      pendingTuitions,
      rejectedTuitions,
      totalApplications,
      payments,
      recentUsers,
      pendingTuitionList,
    ] = await Promise.all([
      db.collection("user").countDocuments({}),
      db.collection("user").countDocuments({ role: "student" }),
      db.collection("user").countDocuments({ role: "tutor" }),
      db.collection("tuition").countDocuments({}),
      db.collection("tuition").countDocuments({ approvalStatus: "approved" }),
      db.collection("tuition").countDocuments({ approvalStatus: "pending" }),
      db.collection("tuition").countDocuments({ approvalStatus: "rejected" }),
      db.collection("application").countDocuments({}),
      db.collection("payment").find({}).toArray(),
      db.collection("user").find({}).sort({ createdAt: -1 }).limit(5).toArray(),
      db
        .collection("tuition")
        .find({ approvalStatus: "pending" })
        .sort({ createdAt: -1 })
        .limit(6)
        .toArray(),
    ]);

    const totalRevenue = payments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      totalTuitions,
      approvedTuitions,
      pendingTuitions,
      rejectedTuitions,
      totalApplications,
      totalPayments: payments.length,
      totalRevenue,
      recentUsers,
      pendingTuitionsList: pendingTuitionList,
    };
  },

  // Aggregate Tutor Metrics
  async getTutorStats(tutorEmail) {
    const db = getDB();

    const [tuitions, applicants] = await Promise.all([
      db.collection("tuition").find({ tutorEmail }).toArray(),
      db.collection("application").find({ tutorEmail }).toArray(),
    ]);

    const totalPosted = tuitions.length;
    const approvedBatches = tuitions.filter(
      (t) => t.approvalStatus === "approved" && t.isActive
    ).length;
    const pendingModeration = tuitions.filter(
      (t) => t.approvalStatus === "pending"
    ).length;

    const totalApplicants = applicants.length;
    const pendingApplicants = applicants.filter(
      (a) => a.status === "pending"
    ).length;
    const acceptedApplicants = applicants.filter(
      (a) => a.status === "accepted"
    ).length;

    return {
      totalPosted,
      approvedBatches,
      pendingModeration,
      totalApplicants,
      pendingApplicants,
      acceptedApplicants,
    };
  },

  // Aggregate Student Metrics
  async getStudentStats(studentEmail) {
    const db = getDB();

    const [applications, user] = await Promise.all([
      db.collection("application").find({ studentEmail }).toArray(),
      db.collection("user").findOne({ email: studentEmail }),
    ]);

    const totalApplied = applications.length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;

    return {
      totalApplied,
      accepted,
      pending,
      rejected,
      savedTuitionsCount: Array.isArray(user?.savedTuitions)
        ? user.savedTuitions.length
        : 0,
      plan: user?.plan || "free",
    };
  },
};
