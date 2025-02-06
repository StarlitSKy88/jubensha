import { Schema, model, Document } from 'mongoose';

// 用户接口
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

// 角色接口
export interface Role extends Document {
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// 权限接口
export interface Permission extends Document {
  roleId: Schema.Types.ObjectId;
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 用户Schema
const UserSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }]
}, { timestamps: true });

// 角色Schema
const RoleSchema = new Schema<Role>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true }
}, { timestamps: true });

// 权限Schema
const PermissionSchema = new Schema<Permission>({
  roleId: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
  resource: { type: String, required: true },
  actions: [{ type: String, required: true }],
  conditions: { type: Schema.Types.Mixed }
}, { timestamps: true });

// 创建索引
PermissionSchema.index({ roleId: 1, resource: 1 }, { unique: true });

// 导出模型
export const UserModel = model<User>('User', UserSchema);
export const RoleModel = model<Role>('Role', RoleSchema);
export const PermissionModel = model<Permission>('Permission', PermissionSchema); 