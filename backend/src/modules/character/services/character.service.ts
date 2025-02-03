import { Types } from 'mongoose';
import { Character, ICharacter } from '../models/character.model';
import { CharacterError } from '../errors/character.error';
import {
  CreateCharacterDto,
  UpdateCharacterDto,
  CharacterQueryDto,
  CharacterResponseDto,
  CharacterRelationshipDto,
  BulkCharacterOperationDto
} from '../dtos/character.dto';

export class CharacterService {
  /**
   * 创建角色
   */
  async createCharacter(
    userId: string,
    projectId: string,
    data: CreateCharacterDto
  ): Promise<ICharacter> {
    try {
      // 检查同一项目中是否存在同名角色
      const existingCharacter = await Character.findOne({
        projectId: new Types.ObjectId(projectId),
        name: data.name
      });

      if (existingCharacter) {
        throw CharacterError.DuplicateError();
      }

      // 创建角色
      const character = new Character({
        ...data,
        creator: new Types.ObjectId(userId),
        projectId: new Types.ObjectId(projectId)
      });

      await character.save();
      return character;
    } catch (error) {
      if (error instanceof CharacterError) throw error;
      throw new CharacterError('创建角色失败', 500);
    }
  }

  /**
   * 获取角色列表
   */
  async getCharacters(
    userId: string,
    query: CharacterQueryDto
  ): Promise<{
    characters: ICharacter[];
    total: number;
  }> {
    try {
      const {
        projectId,
        search,
        tags,
        age,
        gender,
        isPublic,
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = query;

      // 构建查询条件
      const filter: any = {
        projectId: new Types.ObjectId(projectId),
        $or: [
          { creator: new Types.ObjectId(userId) },
          { isPublic: true }
        ]
      };

      if (search) {
        filter.$text = { $search: search };
      }

      if (tags?.length) {
        filter.tags = { $in: tags };
      }

      if (age) {
        if (age.min !== undefined) {
          filter.age = { ...filter.age, $gte: age.min };
        }
        if (age.max !== undefined) {
          filter.age = { ...filter.age, $lte: age.max };
        }
      }

      if (gender) {
        filter.gender = gender;
      }

      if (typeof isPublic === 'boolean') {
        filter.isPublic = isPublic;
      }

      // 计算总数
      const total = await Character.countDocuments(filter);

      // 获取分页数据
      const characters = await Character.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .populate('relationships.character', 'name');

      return { characters, total };
    } catch (error) {
      throw new CharacterError('获取角色列表失败', 500);
    }
  }

  /**
   * 获取单个角色
   */
  async getCharacter(userId: string, characterId: string): Promise<ICharacter> {
    const character = await Character.findById(characterId)
      .populate('creator', 'username')
      .populate('relationships.character', 'name');

    if (!character) {
      throw CharacterError.NotFound();
    }

    if (!character.isPublic && character.creator.toString() !== userId) {
      throw CharacterError.Unauthorized();
    }

    return character;
  }

  /**
   * 更新角色
   */
  async updateCharacter(
    userId: string,
    characterId: string,
    data: UpdateCharacterDto
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw CharacterError.NotFound();
    }

    if (character.creator.toString() !== userId) {
      throw CharacterError.Unauthorized();
    }

    // 如果要更新名称，检查是否存在同名角色
    if (data.name && data.name !== character.name) {
      const existingCharacter = await Character.findOne({
        projectId: character.projectId,
        name: data.name,
        _id: { $ne: character._id }
      });

      if (existingCharacter) {
        throw CharacterError.DuplicateError();
      }
    }

    // 更新角色
    Object.assign(character, data);
    await character.save();

    return character;
  }

  /**
   * 删除角色
   */
  async deleteCharacter(userId: string, characterId: string): Promise<void> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw CharacterError.NotFound();
    }

    if (character.creator.toString() !== userId) {
      throw CharacterError.Unauthorized();
    }

    await character.deleteOne();
  }

  /**
   * 添加角色关系
   */
  async addRelationships(
    userId: string,
    characterId: string,
    relationships: CharacterRelationshipDto[]
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw CharacterError.NotFound();
    }

    if (character.creator.toString() !== userId) {
      throw CharacterError.Unauthorized();
    }

    // 验证目标角色是否存在
    for (const relationship of relationships) {
      const targetCharacter = await Character.findById(relationship.character);
      if (!targetCharacter) {
        throw CharacterError.RelationshipError(`目标角色 ${relationship.character} 不存在`);
      }
    }

    // 添加关系
    character.relationships = character.relationships || [];
    character.relationships.push(...relationships.map(r => ({
      character: new Types.ObjectId(r.character),
      type: r.type,
      description: r.description
    })));

    await character.save();
    return character;
  }

  /**
   * 删除角色关系
   */
  async removeRelationship(
    userId: string,
    characterId: string,
    targetCharacterId: string
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId);

    if (!character) {
      throw CharacterError.NotFound();
    }

    if (character.creator.toString() !== userId) {
      throw CharacterError.Unauthorized();
    }

    character.relationships = character.relationships?.filter(
      r => r.character.toString() !== targetCharacterId
    );

    await character.save();
    return character;
  }

  /**
   * 批量操作
   */
  async bulkOperation(
    userId: string,
    projectId: string,
    data: BulkCharacterOperationDto
  ): Promise<void> {
    try {
      const { characterIds, operation, data: operationData } = data;

      // 验证所有角色是否存在且用户有权限
      const characters = await Character.find({
        _id: { $in: characterIds.map(id => new Types.ObjectId(id)) },
        projectId: new Types.ObjectId(projectId)
      });

      if (characters.length !== characterIds.length) {
        throw CharacterError.BulkOperationError('部分角色不存在');
      }

      const unauthorizedCharacters = characters.filter(
        c => c.creator.toString() !== userId
      );

      if (unauthorizedCharacters.length > 0) {
        throw CharacterError.Unauthorized('对部分角色没有操作权限');
      }

      // 执行批量操作
      switch (operation) {
        case 'delete':
          await Character.deleteMany({
            _id: { $in: characterIds.map(id => new Types.ObjectId(id)) }
          });
          break;

        case 'makePublic':
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $set: { isPublic: true } }
          );
          break;

        case 'makePrivate':
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $set: { isPublic: false } }
          );
          break;

        case 'addTags':
          if (!operationData?.tags?.length) {
            throw CharacterError.BulkOperationError('未指定要添加的标签');
          }
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $addToSet: { tags: { $each: operationData.tags } } }
          );
          break;

        case 'removeTags':
          if (!operationData?.tags?.length) {
            throw CharacterError.BulkOperationError('未指定要移除的标签');
          }
          await Character.updateMany(
            { _id: { $in: characterIds.map(id => new Types.ObjectId(id)) } },
            { $pullAll: { tags: operationData.tags } }
          );
          break;

        default:
          throw CharacterError.BulkOperationError('不支持的操作类型');
      }
    } catch (error) {
      if (error instanceof CharacterError) throw error;
      throw new CharacterError('批量操作失败', 500);
    }
  }
}

export const characterService = new CharacterService(); 