/**
 * Database Seeding Script
 * Seeds the database with initial data using embedded role/department architecture
 * Works with standalone MongoDB (no replica set required)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import { User } from '../models/schemas/user.schema.js';
import { users } from '../models/data.js';

dotenv.config();

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // ===========================
    // CLEAR EXISTING DATA
    // ===========================
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ===========================
    // SEED USERS
    // ===========================
    console.log('👥 Seeding users with embedded role/department data...\n');
    const userMap = new Map();

  // First pass: Create all users without reportingManagerId
  for (const user of users) {
    // DO NOT hash password here - the pre-save hook will handle it
    const created = await User.create({
      name: user.name,
      email: user.email,
      password: user.password, // Plain text - will be hashed by pre-save hook
      role: user.role, // Embedded role object
      department: user.department, // Embedded department object (can be null)
      reportingManagerId: null, // Set in second pass
      reportCode: user.reportCode,
      status: user.status,
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      permissions: user.permissions, // Array of permission code strings
      avatar: user.avatar,
    });

      userMap.set(user.id, created._id);
      
      // Detailed output
      const roleInfo = `${user.role.name} (Level ${user.role.level})`;
      const deptInfo = user.department ? `${user.department.name}` : 'No Department';
      const statusIcon = user.status === 'active' ? '✅' : '⚠️';
      const reportCodeInfo = user.reportCode ? ` | Code: ${user.reportCode}` : '';
      
      console.log(`  ${statusIcon} ${user.name}`);
      console.log(`     Email: ${user.email}`);
      console.log(`     Role: ${roleInfo}`);
      console.log(`     Department: ${deptInfo}`);
      console.log(`     Status: ${user.status}${reportCodeInfo}`);
      console.log(`     Permissions: ${user.permissions.length} permission(s)`);
      console.log('');
    }

    // Second pass: Update reportingManagerId
    console.log('🔗 Setting up reporting relationships...');
    let relationshipCount = 0;
    for (const user of users) {
      if (user.reportingManagerId) {
        const managerOriginalId = user.reportingManagerId;
        const managerMongoId = userMap.get(managerOriginalId);
        const userMongoId = userMap.get(user.id);
        
        await User.updateOne(
          { _id: userMongoId },
          { reportingManagerId: managerMongoId }
        );
        
        // Find manager name for detailed output
        const manager = users.find(u => u.id === managerOriginalId);
        console.log(`  ✓ ${user.name} reports to ${manager.name}`);
        relationshipCount++;
      }
    }
    console.log(`✅ ${relationshipCount} reporting relationships established\n`);

    // ===========================
    // SUMMARY
    // ===========================
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    
    const roleCounts = {
      superAdmin: await User.countDocuments({ 'role.code': 'SUPER_ADMIN' }),
      admin: await User.countDocuments({ 'role.code': 'ADMIN' }),
      hod: await User.countDocuments({ 'role.code': 'HOD' }),
      manager: await User.countDocuments({ 'role.code': 'MANAGER' }),
      employee: await User.countDocuments({ 'role.code': 'EMPLOYEE' }),
    };

    const deptCounts = {
      engineering: await User.countDocuments({ 'department.code': 'ENG' }),
      hr: await User.countDocuments({ 'department.code': 'HR' }),
      finance: await User.countDocuments({ 'department.code': 'FIN' }),
      marketing: await User.countDocuments({ 'department.code': 'MKT' }),
      noDepartment: await User.countDocuments({ department: null }),
    };

    console.log('📊 Seeding Summary:');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('👤 Total Users: ' + totalUsers);
    console.log(`   • Active: ${activeUsers}`);
    console.log(`   • Inactive: ${inactiveUsers}\n`);
    
    console.log('🎭 Users by Role:');
    console.log(`   • Super Admin: ${roleCounts.superAdmin}`);
    console.log(`   • Admin: ${roleCounts.admin}`);
    console.log(`   • HOD: ${roleCounts.hod}`);
    console.log(`   • Manager: ${roleCounts.manager}`);
    console.log(`   • Employee: ${roleCounts.employee}\n`);
    
    console.log('🏢 Users by Department:');
    console.log(`   • Engineering: ${deptCounts.engineering}`);
    console.log(`   • Human Resources: ${deptCounts.hr}`);
    console.log(`   • Finance: ${deptCounts.finance}`);
    console.log(`   • Marketing: ${deptCounts.marketing}`);
    console.log(`   • No Department: ${deptCounts.noDepartment}\n`);
    
    console.log('🔐 Database Architecture:');
    console.log('   • Single User collection with embedded data');
    console.log('   • Roles and Departments embedded in User documents');
    console.log('   • Permissions stored as string arrays');
    console.log('   • Passwords hashed with bcrypt (12 salt rounds)\n');
    
    console.log('═══════════════════════════════════════════');
    console.log('🎉 Database seeding completed successfully!\n');
    
    console.log('📝 Login Credentials:');
    console.log('   Email: superadmin@company.com');
    console.log('   Password: password123\n');

    // Close connection
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    await disconnectDB();
    process.exit(1);
  }
}

// Run seeding
seed();
