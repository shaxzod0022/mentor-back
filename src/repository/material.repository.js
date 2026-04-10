const Material = require("../model/material.model");

class MaterialRepository {
  async findByCourseId(courseId) {
    return await Material.find({ courseId }).sort({ createdAt: -1 });
  }

  async findById(id) {
    return await Material.findById(id);
  }

  async create(materialData) {
    const material = new Material(materialData);
    return await material.save();
  }

  async update(id, updateData) {
    return await Material.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    return await Material.findByIdAndDelete(id);
  }

  async deleteByCourseId(courseId) {
    return await Material.deleteMany({ courseId });
  }
}

module.exports = new MaterialRepository();
