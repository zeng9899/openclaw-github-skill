# GitHub Trending + Feishu Skill

智能获取GitHub热门AI项目数据，生成专业简报并发送到飞书。

## 功能特性

- 🔥 **自动抓取** - 获取GitHub热门AI项目
- 📊 **详细报告** - 包含Stars、Fork、描述、技术栈、链接、关键词
- 📤 **一键发送** - 自动发送到飞书
- 🎯 **灵活配置** - 支持自定义排序方式和数量
- 🛡️ **安全可靠** - 无需API Key，使用GitHub公开API

## 触发指令

- "github热门" / "GitHub趋势" / "热门AI项目"
- "查一下github" / "做一个简报发给我"
- "生成AI项目简报"

## 参数配置

| 参数 | 说明 | 默认值 |
|------|------|--------|
| sort | 排序方式：stars/updated/forks | stars |
| per_page | 返回数量：1-100 | 10 |
| topic | 搜索主题 | artificial-intelligence |

## 使用示例

```
查一下github热门AI项目
查一下github今日前三AI项目
生成AI项目简报发给我
```

## 技术栈

- **数据源**: GitHub REST API (公开无需认证)
- **消息推送**: 飞书开放API
- **运行环境**: OpenClaw

## 注意事项

- ⚠️ GitHub API有速率限制，每小时60次请求
- ⚠️ 建议不要频繁调用
- ✅ 完全免费，无需任何费用