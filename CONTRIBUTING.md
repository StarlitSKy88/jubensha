# 贡献指南

感谢您对ScriptAI项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 报告问题
- 提交功能建议
- 改进文档
- 提交代码修复
- 添加新功能

## 开发环境设置

1. Fork本仓库并克隆到本地：
```bash
git clone https://github.com/yourusername/scriptai.git
cd scriptai
```

2. 创建虚拟环境：
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate  # Windows
```

3. 安装开发依赖：
```bash
pip install -e ".[dev]"
```

4. 安装pre-commit钩子：
```bash
pre-commit install
```

## 代码规范

我们使用以下工具来确保代码质量：

- black：代码格式化
- isort：导入语句排序
- flake8：代码风格检查
- mypy：类型检查
- pylint：代码分析
- bandit：安全检查

所有这些检查都已配置在pre-commit钩子中。

## 提交规范

我们使用[Conventional Commits](https://www.conventionalcommits.org/)规范来编写提交信息。每个提交消息都应该遵循以下格式：

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

类型（type）必须是以下之一：

- feat：新功能
- fix：bug修复
- docs：文档更改
- style：不影响代码含义的更改（空格、格式化等）
- refactor：既不修复bug也不添加功能的代码更改
- perf：改进性能的代码更改
- test：添加或修改测试
- build：影响构建系统或外部依赖的更改
- ci：更改CI配置文件和脚本
- chore：其他不修改src或test文件的更改
- revert：撤销之前的提交

## 测试

在提交代码之前，请确保：

1. 添加适当的测试用例
2. 所有测试都能通过
3. 代码覆盖率不低于当前水平

运行测试：
```bash
pytest
```

## 文档

如果您的更改涉及新功能或修改现有功能，请确保：

1. 更新相关的文档
2. 添加或修改docstring
3. 如果需要，添加使用示例

生成文档：
```bash
mkdocs serve
```

## 提交Pull Request

1. 确保您的代码符合我们的代码规范
2. 更新测试并确保所有测试通过
3. 更新相关文档
4. 提交Pull Request并描述您的更改

## 问题报告

如果您发现了bug或有功能建议，请：

1. 检查现有的Issues，避免重复
2. 使用Issue模板
3. 提供尽可能详细的信息
4. 如果可能，提供重现步骤或最小可重现示例

## 行为准则

请参阅我们的[行为准则](CODE_OF_CONDUCT.md)。

## 许可证

通过贡献代码，您同意您的贡献将根据项目的MIT许可证进行许可。 