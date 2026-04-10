const materialService = require("../service/material.service");

const getMaterialsByCourse = async (req, res) => {
  try {
    const materials = await materialService.getMaterialsByCourse(
      req.params.courseId,
    );
    res.status(200).json(materials.reverse());
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const material = await materialService.getMaterialById(req.params.id);
    res.status(200).json(material);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createMaterial = async (req, res) => {
  try {
    const material = await materialService.createMaterial(
      { ...req.body, userId: req.user._id },
      req.files?.pdf,
    );
    res.status(201).json({
      message: "Material muvaffaqiyatli qo'shildi",
      material,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const material = await materialService.updateMaterial(
      req.params.id,
      { ...req.body, userId: req.user._id },
      req.files?.pdf,
    );
    res.status(200).json({
      message: "Material muvaffaqiyatli yangilandi",
      material,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    await materialService.deleteMaterial(req.params.id, req.user._id);
    res.status(200).json({ message: "Material muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getMaterialsByCourse,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
