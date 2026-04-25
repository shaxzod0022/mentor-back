const submissionService = require("../service/submission.service");

const submitHomework = async (req, res) => {
  try {
    const { materialId, courseId } = req.body;
    const submission = await submissionService.submitHomework(
      req.user._id,
      materialId,
      courseId,
      req.files?.pdf
    );
    res.status(201).json({ message: "Vazifa muvaffaqiyatli topshirildi", submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getCourseSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getCourseSubmissions(req.params.courseId);
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentSubmissions = async (req, res) => {
  try {
    const submissions = await submissionService.getStudentSubmissions(req.user._id, req.params.courseId);
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleGradingPermission = async (req, res) => {
  try {
    const submission = await submissionService.toggleGradingPermission(req.params.id, req.user._id);
    res.status(200).json({ message: "Holat o'zgartirildi", submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const assignGrade = async (req, res) => {
  try {
    const submission = await submissionService.assignGrade(req.params.id, req.body, req.user._id, req.user.role);
    res.status(200).json({ message: "Baho qo'yildi", submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSubmission = async (req, res) => {
  try {
    const result = await submissionService.deleteSubmission(req.params.id, req.user._id, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

const rejectSubmission = async (req, res) => {
  try {
    const submission = await submissionService.rejectSubmission(req.params.id, req.user._id);
    res.status(200).json({ message: "Vazifa yaroqsiz deb belgilandi", submission });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  submitHomework,
  getCourseSubmissions,
  getStudentSubmissions,
  toggleGradingPermission,
  assignGrade,
  deleteSubmission,
  rejectSubmission
};
