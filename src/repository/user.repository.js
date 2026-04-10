const User = require("../model/user.model");

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByIdAndSelect(id, selectFields) {
    return await User.findById(id).select(selectFields);
  }

  async find(query) {
    return await User.find(query);
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, { 
      new: true, 
      runValidators: true 
    });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async listPaginated(query, skip, limit) {
    return await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async count(query) {
    return await User.countDocuments(query);
  }

  async getAggregateStats() {
    return await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getRecentUsers(limit = 5) {
    return await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new UserRepository();
