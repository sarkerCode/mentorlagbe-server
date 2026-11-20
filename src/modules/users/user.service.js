import { ObjectId } from "mongodb";
import { getDB } from "../../config/database.js";

const toQueryId = (id) => {
  if (ObjectId.isValid(id)) {
    return { $in: [new ObjectId(id), String(id)] };
  }
  return String(id);
};

export const userService = {
  // Find user by ID
  async findUserById(id) {
    const db = getDB();
    const query = { _id: toQueryId(id) };
    return await db.collection("users").findOne(query);
  },

  // Update profile fields (name, phone, bio, image)
  async updateProfile(id, updateData) {
    const db = getDB();
    const allowedFields = ["name", "phone", "bio", "image"];
    const filteredUpdate = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    }

    filteredUpdate.updatedAt = new Date();

    const result = await db.collection("users").findOneAndUpdate(
      { _id: toQueryId(id) },
      { $set: filteredUpdate },
      { returnDocument: "after" }
    );

    return result;
  },

  // Get all users (Admin only)
  async getAllUsers() {
    const db = getDB();
    return await db
      .collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Update user role (Admin only)
  async updateUserRole(id, role) {
    const db = getDB();
    const validRoles = ["student", "tutor", "admin"];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    const result = await db.collection("users").findOneAndUpdate(
      { _id: toQueryId(id) },
      { $set: { role, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    return result;
  },
};
