import { UserService } from '../services/user.service';
import { UserModel, UserRole, UserStatus } from '../models/user.model';
import { 
  AuthenticationError, 
  ValidationError, 
  ConflictError,
  NotFoundError 
} from '@utils/errors';
import { config } from '@config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('UserService', () => {
  let userService: UserService;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // 创建内存数据库
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  describe('register', () => {
    const validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: UserRole.USER
    };

    it('should create a new user successfully', async () => {
      const user = await userService.register(validUserData);
      expect(user).toBeDefined();
      expect(user.username).toBe(validUserData.username);
      expect(user.email).toBe(validUserData.email);
      expect(user.role).toBe(UserRole.USER);
      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should hash the password before saving', async () => {
      const user = await userService.register(validUserData);
      expect(user.password).not.toBe(validUserData.password);
    });

    it('should throw error if username already exists', async () => {
      await userService.register(validUserData);
      await expect(userService.register(validUserData))
        .rejects
        .toThrow(ValidationError);
    });

    it('should throw error if email already exists', async () => {
      await userService.register(validUserData);
      await expect(userService.register({
        ...validUserData,
        username: 'another'
      }))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('login', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: UserRole.USER
    };

    beforeEach(async () => {
      await userService.register(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const result = await userService.login({
        email: userData.email,
        password: userData.password
      });

      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error with incorrect password', async () => {
      await expect(userService.login({
        email: userData.email,
        password: 'wrongpassword'
      }))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should throw error with non-existent email', async () => {
      await expect(userService.login({
        email: 'nonexistent@example.com',
        password: userData.password
      }))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should update lastLogin timestamp', async () => {
      const before = new Date();
      const result = await userService.login({
        email: userData.email,
        password: userData.password
      });
      const user = await UserModel.findById(result.user.id);
      expect(user?.lastLogin).toBeDefined();
      expect(user?.lastLogin?.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('updateProfile', () => {
    let userId: string;
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: UserRole.USER
    };

    beforeEach(async () => {
      const user = await userService.register(userData);
      userId = user.id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        username: 'newusername',
        profile: {
          bio: 'New bio',
          location: 'New location'
        }
      };

      const updatedUser = await userService.updateProfile(userId, updateData);
      expect(updatedUser.username).toBe(updateData.username);
      expect(updatedUser.profile?.bio).toBe(updateData.profile.bio);
      expect(updatedUser.profile?.location).toBe(updateData.profile.location);
    });

    it('should throw error when updating non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(userService.updateProfile(fakeId, { username: 'new' }))
        .rejects
        .toThrow(NotFoundError);
    });

    it('should throw error when updating to existing username', async () => {
      await userService.register({
        ...userData,
        username: 'existing',
        email: 'another@example.com'
      });

      await expect(userService.updateProfile(userId, { username: 'existing' }))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('changePassword', () => {
    let userId: string;
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: UserRole.USER
    };

    beforeEach(async () => {
      const user = await userService.register(userData);
      userId = user.id;
    });

    it('should change password successfully', async () => {
      const newPassword = 'NewPassword123';
      await userService.changePassword(userId, {
        oldPassword: userData.password,
        newPassword
      });

      const loginResult = await userService.login({
        email: userData.email,
        password: newPassword
      });
      expect(loginResult.token).toBeDefined();
    });

    it('should throw error with incorrect old password', async () => {
      await expect(userService.changePassword(userId, {
        oldPassword: 'wrongpassword',
        newPassword: 'NewPassword123'
      }))
        .rejects
        .toThrow(AuthenticationError);
    });

    it('should throw error when changing password for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(userService.changePassword(fakeId, {
        oldPassword: userData.password,
        newPassword: 'NewPassword123'
      }))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('getUserById', () => {
    let userId: string;
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123',
      role: UserRole.USER
    };

    beforeEach(async () => {
      const user = await userService.register(userData);
      userId = user.id;
    });

    it('should return user by id', async () => {
      const user = await userService.getUserById(userId);
      expect(user).toBeDefined();
      expect(user?.username).toBe(userData.username);
      expect(user?.email).toBe(userData.email);
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(userService.getUserById(fakeId))
        .rejects
        .toThrow(NotFoundError);
    });
  });
}); 