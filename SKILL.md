# GitHub Trending + Feishu Skill

获取GitHub热门AI项目数据，生成详细简报并发送到飞书。

## Trigger

- "github热门" / "GitHub趋势" / "热门AI项目"
- "查一下github" / "做一个简报发给我"
- "生成word简报"

## Tool

- web_fetch: 获取GitHub API数据
- message: 发送飞书消息

## Steps

1. **获取数据**
   - 使用 web_fetch 调用 GitHub 公开API
   - URL: `https://api.github.com/search/repositories?q=topic:artificial-intelligence+created:>2024-01-01&sort=stars&order=desc&per_page=10`

2. **解析数据**
   - 提取项目名称、star数、fork数、描述、语言、链接、关键词

3. **生成详细简报**
   - 格式：Markdown（飞书可读）
   - 包含：
     - 每个项目的⭐Stars数量
     - 每个项目的🍴Fork数量
     - 每个项目的📝详细描述
     - 每个项目的💻技术栈
     - 每个项目的🔗GitHub链接
     - 每个项目的🏷️关键词标签
   - 技术洞察分析

4. **发送飞书**
   - 使用 message 工具发送到飞书
   - channel: feishu

## Output

飞书消息：包含详细的GitHub热门AI项目简报

## Note

- 不需要RoxyBrowser
- 不需要GitHub Token
- 使用GitHub公开API（免费）
- 不暴露任何API密钥