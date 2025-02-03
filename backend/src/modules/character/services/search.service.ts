import { Character } from '../models/character.model';
import { CharacterQueryDto } from '../dtos/character.dto';
import { CharacterError } from '../errors/character.error';
import { SortOrder } from 'mongoose';

export class SearchService {
  /**
   * 高级搜索角色
   */
  async searchCharacters(query: CharacterQueryDto) {
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
      const filter: any = { projectId };

      // 文本搜索
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { occupation: { $regex: search, $options: 'i' } },
          { background: { $regex: search, $options: 'i' } }
        ];
      }

      // 标签过滤
      if (tags && tags.length > 0) {
        filter.tags = { $all: tags };
      }

      // 年龄过滤
      if (age) {
        if (age.min !== undefined) {
          filter.age = { ...filter.age, $gte: age.min };
        }
        if (age.max !== undefined) {
          filter.age = { ...filter.age, $lte: age.max };
        }
      }

      // 性别过滤
      if (gender) {
        filter.gender = gender;
      }

      // 公开状态过滤
      if (isPublic !== undefined) {
        filter.isPublic = isPublic;
      }

      // 执行查询
      const skip = (page - 1) * limit;
      const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [characters, total] = await Promise.all([
        Character.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('relationships.character', 'name imageUrl')
          .lean(),
        Character.countDocuments(filter)
      ]);

      // 计算分页信息
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        characters,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext,
          hasPrev
        }
      };
    } catch (error) {
      throw new CharacterError('搜索角色失败', 500);
    }
  }

  /**
   * 相似角色推荐
   */
  async findSimilarCharacters(characterId: string, limit: number = 5) {
    try {
      const character = await Character.findById(characterId);
      if (!character) {
        throw new CharacterError('角色不存在', 404);
      }

      // 基于标签和属性的相似度匹配
      const similarCharacters = await Character.find({
        _id: { $ne: characterId },
        projectId: character.projectId,
        $or: [
          { tags: { $in: character.tags || [] } },
          { occupation: character.occupation },
          ...(character.age ? [{ age: { $gte: character.age - 5, $lte: character.age + 5 } }] : [])
        ]
      })
        .limit(limit)
        .populate('relationships.character', 'name imageUrl')
        .lean();

      return similarCharacters;
    } catch (error) {
      throw new CharacterError('查找相似角色失败', 500);
    }
  }

  /**
   * 角色关系网络
   */
  async getCharacterNetwork(projectId: string, depth: number = 2) {
    try {
      const characters = await Character.find({ projectId })
        .select('name relationships')
        .populate('relationships.character', 'name')
        .lean();

      const nodes = characters.map(char => ({
        id: char._id,
        name: char.name,
        relationships: char.relationships?.length || 0
      }));

      const edges = characters.flatMap(char =>
        (char.relationships || []).map(rel => ({
          source: char._id,
          target: rel.character._id,
          type: rel.type
        }))
      );

      return { nodes, edges };
    } catch (error) {
      throw new CharacterError('获取角色关系网络失败', 500);
    }
  }
}

export const searchService = new SearchService(); 