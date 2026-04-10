const mongoose = require('mongoose');
const ActivityLog = require('../src/model/activity.model');
const activityService = require('../src/service/activity.service');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testLimits() {
  try {
    const mongoUri = process.env.DB_URL || 'mongodb://localhost:27017/mentor';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    console.log('Generating 120 logs...');
    for (let i = 0; i < 120; i++) {
        await activityService.log('661600000000000000000001', 'TEST', `Test action ${i}`);
    }

    const count = await ActivityLog.countDocuments();
    console.log(`Final count in DB: ${count}`);
    
    if (count <= 100) {
        console.log('SUCCESS: DB count is within limits.');
    } else {
        console.log('FAILURE: DB count exceeded 100.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testLimits();
