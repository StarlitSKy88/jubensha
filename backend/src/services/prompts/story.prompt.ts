interface StoryInput {
  title?: string;
  theme: string;
  playerCount: string;
  duration: string;
  difficulty: string;
  synopsis?: string;
}

export class StoryPromptTemplate {
  /**
   * 生成故事提示词
   */
  generateStoryPrompt(input: StoryInput): string {
    return `请根据以下要求，创作一个剧本杀故事：

背景信息：
${this.generateBackgroundPrompt(input)}

要求：
1. 故事结构完整，包含开端、发展、高潮、结局
2. 符合${input.duration}的游戏时长
3. 适合${input.playerCount}人游戏
4. 难度定位为${input.difficulty}
5. 主题风格为${input.theme}

${input.synopsis ? `已有故事梗概：${input.synopsis}` : ''}

请按照以下格式输出：
1. 故事大纲：[简要描述故事的主要脉络]
2. 背景设定：[详细描述故事发生的背景]
3. 主要情节：[描述核心剧情发展]
4. 支线情节：[列出2-3个重要的支线剧情]
5. 时间线：[按时间顺序列出关键事件]
6. 优化建议：[提供2-3个改进建议]`;
  }

  /**
   * 生成背景提示词
   */
  private generateBackgroundPrompt(input: StoryInput): string {
    const prompts = [
      `主题：${input.theme}`,
      `游戏人数：${input.playerCount}`,
      `游戏时长：${input.duration}`,
      `难度系数：${input.difficulty}`
    ];

    if (input.title) {
      prompts.unshift(`标题：${input.title}`);
    }

    return prompts.join('\n');
  }

  /**
   * 生成优化提示词
   */
  generateOptimizationPrompt(story: string): string {
    return `请对以下剧本故事进行优化和完善：

${story}

请从以下几个方面提供改进建议：
1. 故事逻辑性和连贯性
2. 人物动机的合理性
3. 线索分布的平衡性
4. 游戏性和趣味性
5. 难度把控

请给出具体的修改建议和优化方向。`;
  }
} 