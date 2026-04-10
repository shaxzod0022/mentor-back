const userService = require("../service/user.service");

const createUser = async (req, res) => {
  try {
    await userService.createUser(req.user.role, { ...req.body, userId: req.user._id });
    res.status(201).json({ message: "Foydalanuvchi muvaffaqiyatli yaratildi" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await userService.loginUser(email, password);

    res.status(200).json({
      message: "Tizimga muvaffaqiyatli kirdingiz ✅",
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user._id);
    res.status(200).json({ user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body, { role: req.user.role, userId: req.user._id });
    res.status(200).json({
      message: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi",
      user: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id, req.user.role);
    res.status(200).json({ message: "Foydalanuvchi muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await userService.getAllUsers(req.query, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const result = await userService.getDashboardStats(req.user.role, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server xatosi", error: error.message });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
  getAllUsers,
  getDashboardStats,
};
