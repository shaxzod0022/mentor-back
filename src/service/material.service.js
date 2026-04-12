const materialRepository = require("../repository/material.repository");
const path = require("path");
const fs = require("fs");
const activityService = require("./activity.service");
const notificationService = require("./notification.service");

class MaterialService {
  async getMaterialsByCourse(courseId) {
    return await materialRepository.findByCourseId(courseId);
  }

  async getMaterialById(id) {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new Error("Material topilmadi!");
    }
    return material;
  }

  async createMaterial(materialData, pdfFile) {
    const { name, description, videoUrl, courseId, deadline } = materialData;

    let pdfPath = "";
    if (pdfFile) {
      if (pdfFile.mimetype !== 'application/pdf') {
        throw new Error("Faqat PDF fayllarni yuklash mumkin!");
      }

      const uploadDir = path.join(__dirname, "../upload/materials");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${pdfFile.name}`;
      pdfPath = `/upload/materials/${fileName}`;
      const fullPath = path.join(uploadDir, fileName);
      
      await pdfFile.mv(fullPath);
    }

    const material = await materialRepository.create({
      name,
      description,
      videoUrl,
      courseId,
      pdfUrl: pdfPath,
      deadline,
    });

    await activityService.log(materialData.userId, "MATERIAL_CREATED", `"${name}" materialini qo'shdi`);
    
    // Notify course members
    await notificationService.notifyCourseMembers(
      courseId,
      materialData.userId,
      "NEW_MATERIAL",
      `Yangi dars/topshiriq qo'shildi: ${name}`,
      courseId
    );

    return material;
  }

  async updateMaterial(id, materialData, pdfFile) {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new Error("Material topilmadi!");
    }

    const { name, description, videoUrl, deadline } = materialData;
    let updateData = { name, description, videoUrl };
    if (deadline) updateData.deadline = deadline;

    if (pdfFile) {
      if (pdfFile.mimetype !== 'application/pdf') {
        throw new Error("Faqat PDF fayllarni yuklash mumkin!");
      }

      const uploadDir = path.join(__dirname, "../upload/materials");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Delete old PDF if exists
      if (material.pdfUrl) {
        const oldPdfPath = path.join(__dirname, "..", material.pdfUrl);
        if (fs.existsSync(oldPdfPath)) {
          fs.unlinkSync(oldPdfPath);
        }
      }

      const fileName = `${Date.now()}-${pdfFile.name}`;
      updateData.pdfUrl = `/upload/materials/${fileName}`;
      const fullPath = path.join(uploadDir, fileName);
      
      await pdfFile.mv(fullPath);
    }

    const updatedMaterial = await materialRepository.update(id, updateData);
    await activityService.log(materialData.userId, "MATERIAL_UPDATED", `"${updatedMaterial.name}" materialini tahrirladi`);
    return updatedMaterial;
  }

  async deleteMaterial(id, userId) {
    const material = await materialRepository.findById(id);
    if (!material) {
      throw new Error("Material topilmadi!");
    }

    // Delete PDF file
    if (material.pdfUrl) {
      const pdfPath = path.join(__dirname, "..", material.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    const result = await materialRepository.delete(id);
    await activityService.log(arguments[1] || id, "MATERIAL_DELETED", `"${material.name}" materialini o'chirdi`);
    return result;
  }
}

module.exports = new MaterialService();
