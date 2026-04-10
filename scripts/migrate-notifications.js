const mongoose = require('mongoose');
const Notification = require('../src/model/notification.model');
const User = require('../src/model/user.model');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEACHER: "teacher",
  MENTOR: "mentor",
  STUDENT: "student",
};

async function migrate() {
  try {
    const mongoUri = process.env.DB_URL || 'mongodb://localhost:27017/mentor';
    console.log(`Ulanishga urunilmoqda: ${mongoUri.split('@')[1] || mongoUri}`); // Hide credentials in log
    await mongoose.connect(mongoUri);
    console.log('MongoDB ga ulanish muvaffaqiyatli!');

    const notifications = await Notification.find().populate('recipient');
    console.log(`Jami ${notifications.length} ta bildirishnoma topildi.`);

    let updatedCount = 0;

    for (const n of notifications) {
      if (!n.recipient) {
        console.warn(`Bildirishnoma ${n._id} da qabul qiluvchi topilmadi.`);
        continue;
      }

      // Extract course ID from existing link
      const courseIdMatch = n.link.match(/[a-f\d]{24}$/i);
      if (!courseIdMatch) continue;
      const courseId = courseIdMatch[0];
      
      let newLink = `/admin/courses/${courseId}`;
      if (n.recipient.role === ROLES.STUDENT) {
        newLink = `/dashboard/courses/${courseId}`;
      }
      
      if (n.link !== newLink) {
        n.link = newLink;
        await n.save();
        updatedCount++;
      }
    }

    console.log(`Migratsiya yakunlandi. ${updatedCount} ta bildirishnoma yangilandi.`);
    process.exit(0);
  } catch (error) {
    console.error('Migratsiya xatosi:', error);
    process.exit(1);
  }
}

migrate();
