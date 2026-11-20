import { userService } from "./user.service.js";

export const userController = {
  // Get current logged-in user profile
  async getProfile(req, res, next) {
    try {
      const user = await userService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  // Update current user profile
  async updateProfile(req, res, next) {
    try {
      const { name, phone, bio, image } = req.body;
      const updatedUser = await userService.updateProfile(req.user.id, {
        name,
        phone,
        bio,
        image,
      });

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found or update failed.",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Get all users
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  // Admin: Update user role
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          message: "Role is required.",
        });
      }

      const updatedUser = await userService.updateUserRole(id, role);
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      res.status(200).json({
        success: true,
        message: `User role updated to ${role} successfully.`,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
};
