import { applicationService } from "./application.service.js";

export const applicationController = {
  // Student: Apply for tuition
  async create(req, res, next) {
    try {
      const newApp = await applicationService.createApplication(
        req.user,
        req.body
      );
      res.status(201).json({
        success: true,
        message: "Application submitted successfully.",
        data: newApp,
      });
    } catch (error) {
      next(error);
    }
  },

  // Student: Get my applications
  async getMyApplications(req, res, next) {
    try {
      const applications = await applicationService.getMyApplications(
        req.user.email
      );
      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },

  // Student: Cancel pending application
  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const result = await applicationService.cancelApplication(
        id,
        req.user.email
      );

      if (result.deletedCount === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Application not found or cannot be cancelled (only pending applications can be cancelled).",
        });
      }

      res.status(200).json({
        success: true,
        message: "Application cancelled successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Get all applicants
  async getTutorApplicants(req, res, next) {
    try {
      const applicants = await applicationService.getTutorApplicants(
        req.user.email
      );
      res.status(200).json({
        success: true,
        data: applicants,
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Update applicant status
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required ('accepted' | 'rejected').",
        });
      }

      const updated = await applicationService.updateStatus(
        id,
        req.user.email,
        status
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Application not found or unauthorized.",
        });
      }

      res.status(200).json({
        success: true,
        message: `Application status updated to ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
