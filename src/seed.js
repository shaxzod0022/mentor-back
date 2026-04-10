require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./model/user.model");
const connectDB = require("./config/db");
const { ROLES } = require("./util/roles");

const seedSuperAdmin = async () => {
  try {
    await connectDB();

    const email = "admin@mentor.uz"; // O'zingiz xohlagan email
    const password = "admin123";      // O'zingiz xohlagan parol

    const existUser = await User.findOne({ email });
    if (existUser) {
      console.log("Super Admin allaqachon mavjud!");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = new User({
      firstName: "Super",
      lastName: "Admin",
      email: email,
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
    });

    await superAdmin.save();
    console.log("-----------------------------------");
    console.log("Super Admin muvaffaqiyatli yaratildi! ✅");
    console.log(`Email: ${email}`);
    console.log(`Parol: ${password}`);
    console.log("-----------------------------------");

    process.exit();
  } catch (error) {
    console.error("Xatolik:", error.message);
    process.exit(1);
  }
};

seedSuperAdmin();
