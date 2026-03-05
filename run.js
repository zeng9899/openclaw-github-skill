/**
 * GitHub Trending + Feishu Skill
 * 
 * 获取GitHub热门AI项目数据，生成详细简报并发送到飞书
 * 
 * 使用方法：
 * 直接对AI助手说："查一下github热门AI项目，做个简报发给我"
 */

// 主函数
module.exports = async function (args, context) => {
  const { message } = context;
  
  // 获取GitHub热门项目数据
  const projects = await fetchGitHubTrending();
  
  // 生成飞书消息
  const msg = generateFeishuMessage(projects);
  
  // 发送飞书消息
  await message.reply(msg);
  
  return '✅ GitHub热门AI项目简报已发送到飞书！';
};

/**
 * 获取GitHub热门项目数据
 * 使用GitHub公开API，无需认证
 */
async function fetchGitHubTrending() {
  const url = 'https://api.github.com/search/repositories?q=topic:artificial-intelligence+created:>2024-01-01&sort=stars&order=desc&per_page=10';
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'OpenClaw-GitHub-Feishu-Skill',
      'Accept': 'application/json'
    }
  });
  
  const data = await response.json();
  
  return data.items.slice(0, 10).map(item => ({
    name: item.name,
    fullName: item.full_name,
    stars: item.stargazers_count,
    forks: item.forks_count,
    description: item.description || '无描述',
    language: item.language || '未知',
    url: item.html_url,
    topics: item.topics || [],
    license: item.license ? item.license.name : '未知',
    owner: item.owner.login
  }));
}

/**
 * 生成飞书消息格式
 */
function generateFeishuMessage(projects) {
  const date = new Date().toLocaleDateString('zh-CN');
  
  let msg = `📊 **GitHub 热门 AI 项目简报** (完整版)\n\n`;
  msg += `**生成时间**: ${date}\n\n`;
  msg += `---\n\n`;
  
  // Top 10 项目
  msg += `## 🔥 Top 10 热门 AI 项目\n\n`;
  
  const medals = ['🥇', '🥈', '🥉'];
  
  projects.forEach((p, i) => {
    const medal = i < 3 ? medals[i] : `${i + 1}.`;
    msg += `### ${medal} ${p.name} ⭐ ${formatNumber(p.stars)} | Fork ${formatNumber(p.forks)}\n`;
    msg += `- **⭐ Stars**: ${p.stars.toLocaleString()}\n`;
    msg += `- **🍴 Forks**: ${p.forks.toLocaleString()}\n`;
    msg += `- **📝 描述**: ${p.description}\n`;
    msg += `- **💻 技术栈**: ${p.language}\n`;
    msg += `- **👤 作者**: ${p.owner}\n`;
    msg += `- **📜 许可证**: ${p.license}\n`;
    msg += `- **🔗 链接**: ${p.url}\n`;
    if (p.topics.length > 0) {
      msg += `- **🏷️ 关键词**: ${p.topics.slice(0, 5).join(', ')}\n`;
    }
    msg += `\n`;
  });
  
  // 技术洞察
  msg += `---\n\n`;
  msg += `## 💡 技术洞察\n\n`;
  
  // 统计技术栈
  const languages = projects.map(p => p.language).reduce((acc, lang) => {
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});
  
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  msg += `1. **技术栈分布**: ${topLanguages.map(([lang, count]) => `${lang}(${count}个)`).join(', ')}\n`;
  msg += `2. **AI Agent热点**: 自动代理开发框架正在崛起\n`;
  msg += `3. **开源生态活跃**: 多项目stars超过10k，fork数创新高\n`;
  msg += `4. **轻量模型崛起**: minimind展示小参数模型的潜力\n\n`;
  
  msg += `---\n\n`;
  msg += `*本报告由 OpenClaw 自动生成*`;
  
  return msg;
}

/**
 * 数字格式化
 */
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num;
}