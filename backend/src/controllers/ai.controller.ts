import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { Character } from '../models/character.model';
import { AppError } from '../utils/error';

export class AIController {
  /**
   * 分析角色
   */
  async analyzeCharacter(req: Request, res: Response, next: NextFunction) {
    try {
      const character = req.body as Character;
      const analysis = await aiService.analyzeCharacter(character);
      res.json({
        success: true,
        data: {
          suggestions: analysis
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 生成角色对话建议
   */
  async generateDialogue(req: Request, res: Response, next: NextFunction) {
    try {
      const { character, context } = req.body;
      if (!character || !context) {
        throw new AppError('INVALID_PARAMS', '缺少必要的参数');
      }

      const dialogue = await aiService.generateDialogueSuggestion(character, context);
      res.json({
        success: true,
        data: {
          dialogue
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController(); 