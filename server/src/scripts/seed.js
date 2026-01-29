/**
 * Database Seeding Script
 * Seeds the database with initial data (roles, departments, permissions, users)
 * Works with standalone MongoDB (no replica set required)
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/database.js';
import { Role, Department, Permission, User } from '../models/schemas/user.schema.js';
import { roles, departments, permissions, users } from '../models/data.js';

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

/**
 * Seed permissions recursively with hierarchy
 */
async function seedPermission(perm, parentId = null, level = 1) {
  const permMap = new Map();

  const created = await Permission.create({
    name: perm.name,
    code: perm.code,
    description: perm.description,
    parentId,
    level,
  });

  permMap.set(perm.id, created._id);

  // Seed children recursively
  if (perm.children && perm.children.length > 0) {
    for (const child of perm.children) {
      const childMap = await seedPermission(child, created._id, level + 1);
      // Merge child map into parent map
      childMap.forEach((value, key) => permMap.set(key, value));
    }
  }

  return permMap;
}

/**
 * Main seeding function
 */
async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Check if MongoDB supports transactions (replica set)
    const useTransactions = mongoose.connection.db
      .admin()
      .serverStatus()
      .then((status) => status.repl && status.repl.setName)
      .catch(() => false);

    console.log(`📋 Transaction support: ${(await useTransactions) ? 'Yes (Replica Set)' : 'No (Standalone)'}\n`);

    // ===========================
    // CLEAR EXISTING DATA
    // ===========================
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Permission.deleteMany({});
    await Role.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // ===========================
    // SEED ROLES
    // ===========================
    console.log('📝 Seeding roles...');
    const roleMap = new Map();

    for (const role of roles) {
      const created = await Role.create({
        name: role.name,
        code: role.code,
        level: role.level,
        description: role.description,
        canAssignRoles: role.canAssignRoles,
      });
      roleMap.set(role.id, created._id);
      console.log(`  ✓ Created role: ${role.name} (Level ${role.level})`);
    }
    console.log(`✅ ${roles.length} roles seeded\n`);

    // ===========================
    // SEED DEPARTMENTS
    // ===========================
    console.log('🏢 Seeding departments...');
    const deptMap = new Map();

    for (const dept of departments) {
      const created = await Department.create({
        name: dept.name,
        code: dept.code,
        description: dept.description,
        headId: null, // Will update after users are created
      });
      deptMap.set(dept.id, created._id);
      console.log(`  ✓ Created department: ${dept.name} (${dept.code})`);
    }
    console.log(`✅ ${departments.length} departments seeded\n`);

    // ===========================
    // SEED PERMISSIONS
    // ===========================
    console.log('🔐 Seeding permissions...');
    const permMap = new Map();

    for (const perm of permissions) {
      const childMap = await seedPermission(perm);
      childMap.forEach((value, key) => permMap.set(key, value));
      console.log(`  ✓ Created permission tree: ${perm.name}`);
    }

    const totalPerms = await Permission.countDocuments();
    console.log(`✅ ${totalPerms} permissions seeded (including nested)\n`);

    // ===========================
    // SEED USERS
    // ===========================
    console.log('👥 Seeding users...');
    const userMap = new Map();

    // First pass: Create all users without reportingManagerId
    for (const user of users) {
      // Hash password (using bcrypt instead of placeholder)
      const hashedPassword = await bcrypt.hash('password123', SALT_ROUNDS);

      const created = await User.create({
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
        roleId: roleMap.get(user.roleId),
        departmentId: user.departmentId ? deptMap.get(user.departmentId) : null,
        reportingManagerId: null, // Set in second pass
        reportCode: user.reportCode,
        status: user.status,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
        permissions: user.permissions,
        avatar: user.avatar,
      });

      userMap.set(user.id, created._id);
      console.log(`  ✓ Created user: ${user.name} (${user.role})`);
    }

    // Second pass: Update reportingManagerId
    console.log('  → Updating reporting relationships...');
    for (const user of users) {
      if (user.reportingManagerId) {
        await User.updateOne(
          { _id: userMap.get(user.id) },
          { reportingManagerId: userMap.get(user.reportingManagerId) }
        );
      }
    }

    // Third pass: Update department heads
    console.log('  → Assigning department heads...');
    for (const dept of departments) {
      if (dept.headId) {
        await Department.updateOne({ _id: deptMap.get(dept.id) }, { headId: userMap.get(dept.headId) });
      }
    }

    console.log(`✅ ${users.length} users seeded\n`);

    // ===========================
    // SUMMARY
    // ===========================
    console.log('📊 Seeding Summary:');
    console.log(`  • Roles: ${roles.length}`);
    console.log(`  • Departments: ${departments.length}`);
    console.log(`  • Permissions: ${totalPerms} (with hierarchy)`);
    console.log(`  • Users: ${users.length}`);
    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📝 Login Credentials:');
    console.log('  Email: superadmin@company.com');
    console.log('  Password: password123');
    console.log('');

    // Close connection
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run seeding
seed();
