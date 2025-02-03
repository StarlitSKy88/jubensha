import axios from 'axios';
import { Character } from '../models/character.model';
import { AppError } from '../utils/error';

export class AIService {
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'sk-4e8e23e071184186b1a70bd7b87cbff3';
    this.apiEndpoint = 'https://api.deepseek.com/v1';
  }

  /**
   * 分析角色信息并提供建议
   * @param character 角色信息
   * @returns 分析结果和建议
   */
  async analyzeCharacter(character: Character): Promise<string> {
    try {
      const prompt = this.generateCharacterAnalysisPrompt(character);
      const response = await this.callDeepseekAPI(prompt);
      return this.formatAnalysisResponse(response);
    } catch (error) {
      console.error('角色分析失败:', error);
      throw new AppError('AI_ANALYSIS_FAILED', '角色分析失败，请稍后重试');
    }
  }

  /**
   * 生成角色分析提示词
   * @param character 角色信息
   * @returns 格式化的提示词
   */
  private generateCharacterAnalysisPrompt(character: Character): string {
    return `请分析以下角色，并提供建议：
角色名称：${character.name}
角色描述：${character.description}
年龄：${character.age || '未知'}
性别：${character.gender || '未知'}
职业：${character.occupation || '未知'}
性格特征：${character.personality?.join('、') || '未知'}
背景故事：${character.background || '未知'}
标签：${character.tags?.join('、') || '无'}

请从以下几个方面进行分析和提供建议：
1. 角色性格的完整性和合理性
2. 背景故事的深度和连贯性
3. 角色发展的潜在方向
4. 可能的冲突点和戏剧性元素
5. 与其他角色的潜在互动建议`;
  }

  /**
   * 调用Deepseek API
   * @param prompt 提示词
   * @returns API响应
   */
  private async callDeepseekAPI(prompt: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.apiEndpoint}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: '你是一个专业的故事角色分析师，擅长分析角色设定并提供建设性建议。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Deepseek API调用失败:', error);
      throw new AppError('AI_API_ERROR', 'AI服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 格式化分析响应
   * @param response API响应
   * @returns 格式化的分析结果
   */
  private formatAnalysisResponse(response: string): string {
    // 可以在这里添加额外的响应格式化逻辑
    return response;
  }

  /**
   * 生成角色对话建议
   * @param character 角色信息
   * @param context 对话上下文
   * @returns 对话建议
   */
  async generateDialogueSuggestion(
    character: Character,
    context: string
  ): Promise<string> {
    try {
      const prompt = `基于以下角色信息和上下文，生成合适的对话：
角色信息：
${JSON.stringify(character, null, 2)}

对话上下文：
${context}

请生成符合角色性格和背景的对话内容。`;

      const response = await this.callDeepseekAPI(prompt);
      return this.formatDialogueResponse(response);
    } catch (error) {
      console.error('对话生成失败:', error);
      throw new AppError('AI_DIALOGUE_FAILED', '对话生成失败，请稍后重试');
    }
  }

  /**
   * 格式化对话响应
   * @param response API响应
   * @returns 格式化的对话内容
   */
  private formatDialogueResponse(response: string): string {
    // 可以在这里添加对话响应的格式化逻辑
    return response;
  }
}

export const aiService = new AIService(); 