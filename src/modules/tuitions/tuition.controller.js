import { tuitionService } from "./tuition.service.js";

export const tuitionController = {
  // Public: 6 Featured tuitions for home page
  async getFeatured(req, res, next) {
    try {
      const tuitions = await tuitionService.getFeaturedTuitions();
      res.status(200).json({
        success: true,
        data: tuitions,
      });
    } catch (error) {
      next(error);
    }
  },

  // Public: Paginated & filtered tuitions
  async getAll(req, res, next) {
    try {
      const { search, subject, classLevel, mode, page, limit } = req.query;
      const result = await tuitionService.getAllTuitions({
        search,
        subject,
        classLevel,
        mode,
        page,
        limit,
      });

      res.status(200).json({
        success: true,
        data: result.tuitions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Public: Single tuition details
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const tuition = await tuitionService.getTuitionById(id);

      if (!tuition) {
        return res.status(404).json({
          success: false,
          message: "Tuition post not found.",
        });
      }

      res.status(200).json({
        success: true,
        data: tuition,
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Create new tuition
  async create(req, res, next) {
    try {
      const newTuition = await tuitionService.createTuition(req.user, req.body);
      res.status(201).json({
        success: true,
        message: "Tuition posted successfully. Awaiting admin approval.",
        data: newTuition,
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Get their own tuitions
  async getMyTuitions(req, res, next) {
    try {
      const tuitions = await tuitionService.getMyTuitions(req.user.email);
      res.status(200).json({
        success: true,
        data: tuitions,
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Update their tuition
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await tuitionService.updateTuition(
        id,
        req.user.email,
        req.body
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found or unauthorized.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tuition updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Delete tuition
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await tuitionService.deleteTuition(id, req.user.email);

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found or unauthorized.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Tuition deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },

  // Tutor: Toggle active status
  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await tuitionService.toggleTuitionStatus(
        id,
        req.user.email
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found or unauthorized.",
        });
      }

      res.status(200).json({
        success: true,
        message: `Tuition status updated to ${
          updated.isActive ? "Active" : "Closed"
        }.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get all tuitions for moderation
  async getAdminTuitions(req, res, next) {
    try {
      const tuitions = await tuitionService.getAdminTuitions();
      res.status(200).json({
        success: true,
        data: tuitions,
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Approve or Reject tuition
  async moderate(req, res, next) {
    try {
      const { id } = req.params;
      const { approvalStatus } = req.body;

      if (!approvalStatus) {
        return res.status(400).json({
          success: false,
          message: "approvalStatus is required ('approved' | 'rejected').",
        });
      }

      const updated = await tuitionService.moderateTuition(id, approvalStatus);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Tuition not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: `Tuition status updated to ${approvalStatus}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
};
