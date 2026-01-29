/**
 * User Schema
 * Single schema with embedded role, department, and permission data
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;

// =====================
// USER SCHEMA (with embedded data)
// =====================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    // Embedded Role Data
    role: {
      type: {
        name: { type: String, required: true },
        code: { type: String, required: true, uppercase: true },
        level: { type: Number, required: true, min: 1, max: 5 },
        description: { type: String, required: true },
        canAssignRoles: { type: [String], default: [] },
      },
      required: [true, 'Role is required'],
    },
    // Embedded Department Data (optional)
    department: {
      type: {
        name: { type: String, required: true },
        code: { type: String, required: true, uppercase: true },
        description: { type: String, required: true },
      },
      default: null,
    },
    reportingManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reportCode: {
      type: String,
      required: [true, 'Report code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]{8}$/, 'Report code must be 8 alphanumeric characters'],
      minlength: [8, 'Report code must be exactly 8 characters'],
      maxlength: [8, 'Report code must be exactly 8 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Permissions as array of codes
    permissions: {
      type: [String],
      default: [],
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ reportCode: 1 });
userSchema.index({ 'role.code': 1, status: 1 });
userSchema.index({ 'department.code': 1 });
userSchema.index({ reportingManagerId: 1 });

// Virtual: Get subordinates (users reporting to this user)
userSchema.virtual('subordinates', {
  ref: 'User',
  localField: '_id',
  foreignField: 'reportingManagerId',
});

// Virtual: Get reporting manager details
userSchema.virtual('reportingManager', {
  ref: 'User',
  localField: 'reportingManagerId',
  foreignField: '_id',
  justOne: true,
});

// Pre-save hook: Hash password if modified & ensure report code is uppercase
userSchema.pre('save', async function (next) {
  try {
    // Ensure report code is uppercase
    if (this.reportCode) {
      this.reportCode = this.reportCode.toUpperCase();
    }

    // Ensure role code is uppercase
    if (this.role && this.role.code) {
      this.role.code = this.role.code.toUpperCase();
    }

    // Ensure department code is uppercase
    if (this.department && this.department.code) {
      this.department.code = this.department.code.toUpperCase();
    }

    // Only hash password if it's new or modified
    if (this.isModified('password')) {
      const hashedPassword = await bcrypt.hash(this.password, SALT_ROUNDS);
      this.password = hashedPassword;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method: Check if user has a specific permission
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

// Instance method: Check if user has any of the specified permissions
userSchema.methods.hasAnyPermission = function (permissionsArray) {
  return permissionsArray.some((permission) => this.permissions.includes(permission));
};

// Instance method: Check if user has all of the specified permissions
userSchema.methods.hasAllPermissions = function (permissionsArray) {
  return permissionsArray.every((permission) => this.permissions.includes(permission));
};

// Instance method: Get lean user (without password)
userSchema.methods.toLean = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Static method: Find by email
userSchema.statics.findByEmail = async function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method: Find by report code
userSchema.statics.findByReportCode = async function (reportCode) {
  return this.findOne({ reportCode: reportCode.toUpperCase() });
};

// Static method: Check if email exists
userSchema.statics.emailExists = async function (email, excludeId = null) {
  const query = { email: email.toLowerCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Static method: Check if report code exists
userSchema.statics.reportCodeExists = async function (reportCode, excludeId = null) {
  const query = { reportCode: reportCode.toUpperCase() };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const user = await this.findOne(query);
  return !!user;
};

// Static method: Get users by role code
userSchema.statics.findByRoleCode = async function (roleCode) {
  return this.find({ 'role.code': roleCode.toUpperCase() });
};

// Static method: Get users by department code
userSchema.statics.findByDepartmentCode = async function (deptCode) {
  return this.find({ 'department.code': deptCode.toUpperCase() });
};

// =====================
// EXPORT MODEL
// =====================

export const User = mongoose.model('User', userSchema);

export default User;
