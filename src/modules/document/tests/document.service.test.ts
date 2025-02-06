import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DocumentModel } from '../models/document.model';
import { DocumentVersionModel } from '../models/document-version.model';
import { DocumentService } from '../services/document.service';
import { NotFoundError, ValidationError } from '@utils/errors';

describe('DocumentService', () => {
  let mongoServer: MongoMemoryServer;
  let documentService: DocumentService;
  const userId = new mongoose.Types.ObjectId();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    documentService = new DocumentService();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await DocumentModel.deleteMany({});
    await DocumentVersionModel.deleteMany({});
  });

  describe('createDocument', () => {
    it('should create a document successfully', async () => {
      const documentData = {
        title: '测试文档',
        content: '这是一个测试文档',
        type: 'SCRIPT',
        tags: ['测试', '文档'],
        projectId: new mongoose.Types.ObjectId(),
      };

      const document = await documentService.createDocument({
        ...documentData,
        createdBy: userId,
      });

      expect(document).toBeDefined();
      expect(document.title).toBe(documentData.title);
      expect(document.content).toBe(documentData.content);
      expect(document.version).toBe(1);
      expect(document.createdBy.toString()).toBe(userId.toString());
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        title: '', // 空标题
        content: '这是一个测试文档',
        type: 'INVALID_TYPE',
        projectId: new mongoose.Types.ObjectId(),
      };

      await expect(
        documentService.createDocument({
          ...invalidData,
          createdBy: userId,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('updateDocument', () => {
    it('should update document and create new version', async () => {
      // 创建原始文档
      const document = await DocumentModel.create({
        title: '原始文档',
        content: '原始内容',
        type: 'SCRIPT',
        version: 1,
        createdBy: userId,
        updatedBy: userId,
        projectId: new mongoose.Types.ObjectId(),
      });

      // 更新文档
      const updateData = {
        title: '更新后的文档',
        content: '更新后的内容',
      };

      const updatedDocument = await documentService.updateDocument(
        document._id.toString(),
        updateData,
        userId
      );

      // 验证文档更新
      expect(updatedDocument.title).toBe(updateData.title);
      expect(updatedDocument.content).toBe(updateData.content);
      expect(updatedDocument.version).toBe(2);

      // 验证版本创建
      const version = await DocumentVersionModel.findOne({
        documentId: document._id,
      });
      expect(version).toBeDefined();
      expect(version?.version).toBe(2);
      expect(version?.changes).toHaveLength(2); // title和content的变更
    });

    it('should throw error when document not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      await expect(
        documentService.updateDocument(
          nonExistentId.toString(),
          { title: '新标题' },
          userId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getDocumentVersions', () => {
    it('should return document versions', async () => {
      // 创建文档
      const document = await DocumentModel.create({
        title: '测试文档',
        content: '原始内容',
        type: 'SCRIPT',
        version: 1,
        createdBy: userId,
        updatedBy: userId,
        projectId: new mongoose.Types.ObjectId(),
      });

      // 创建多个版本
      await DocumentVersionModel.create([
        {
          documentId: document._id,
          version: 1,
          title: '测试文档',
          content: '原始内容',
          changes: [],
          createdBy: userId,
        },
        {
          documentId: document._id,
          version: 2,
          title: '测试文档',
          content: '更新内容1',
          changes: [
            {
              field: 'content',
              oldValue: '原始内容',
              newValue: '更新内容1',
            },
          ],
          createdBy: userId,
        },
      ]);

      const { versions, total } = await documentService.getDocumentVersions(
        document._id.toString(),
        userId
      );

      expect(total).toBe(2);
      expect(versions).toHaveLength(2);
      expect(versions[0].version).toBe(2); // 最新版本在前
      expect(versions[1].version).toBe(1);
    });
  });
}); 