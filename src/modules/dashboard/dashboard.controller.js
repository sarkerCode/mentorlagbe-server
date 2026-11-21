import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  // GET /api/dashboard/stats: Role-based aggregated metrics
  async getStats(req, res, next) {
    try {
      const user = req.user;
      const role = user?.role || "student";

      let stats;

      if (role === "admin") {
        stats = await dashboardService.getAdminStats();
      } else if (role === "tutor") {
        stats = await dashboardService.getTutorStats(user.email);
      } else {
        stats = await dashboardService.getStudentStats(user.email);
      }

      return res.status(200).json({
        success: true,
        role,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
