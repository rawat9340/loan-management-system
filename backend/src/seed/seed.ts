import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

dotenv.config();

const seedUsers = [
  { name: 'Admin User', email: 'admin@lms.com', password: 'Admin@123', role: 'ADMIN' },
  { name: 'Sales Officer', email: 'sales@lms.com', password: 'Sales@123', role: 'SALES' },
  { name: 'Sanction Officer', email: 'sanction@lms.com', password: 'Sanction@123', role: 'SANCTION' },
  { name: 'Disbursement Officer', email: 'disburse@lms.com', password: 'Disburse@123', role: 'DISBURSEMENT' },
  { name: 'Collection Officer', email: 'collection@lms.com', password: 'Collection@123', role: 'COLLECTION' },
];

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connected to MongoDB');

    for (const userData of seedUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (existing) {
        console.log(`⏭  Skipping ${userData.email} — already exists`);
        continue;
      }

      await User.create({
  name: userData.name,
  email: userData.email,
  password: userData.password,
  role: userData.role,
});

      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n🌱 Seed completed!');
    console.log('\n📋 Credentials:');
    seedUsers.forEach((u) => {
      console.log(`   ${u.role.padEnd(15)} ${u.email.padEnd(25)} ${u.password}`);
    });

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

seed();
