/**
 * GitHub Trending + Feishu Skill
 * 
 * 获取GitHub热门AI项目数据，生成专业简报并发送到飞书
 * 
 * @version 2.0.0
 * @author OpenClaw
 * 
 * 使用方法：
 * 直接对AI助手说："查一下github热门AI项目，做个简报发给我"
 */

// ==================== 配置 ====================
const CONFIG = {
  // GitHub API配置
  GITHUB_API: {
    baseUrl: 'https://api.github.com/search/repositories',
    defaultTopic: 'artificial-intelligence',
    defaultSort: 'stars',
    defaultOrder: 'desc',
    defaultPerPage: 10,
    minCreated: '2024-01-01'
  },
  
  // 格式化配置
  FORMAT: {
    dateLocale: 'zh-CN',
    showFullDescription: true,
    maxDescriptionLength: 150,
    showTopicsMax: 5
  }
};

// ==================== 主函数 ====================
module.exports = async function (args = {}, context = {}) {
  // 解析参数
  const params = parseParams(args);
  
  // 获取GitHub热门项目数据
  console.log(`📡 正在获取GitHub热门AI项目...`);
  const projects = await fetchGitHubTrending(params);
  
  if (!projects || projects.length === 0) {
    return '❌ 未获取到任何项目数据，请稍后重试。';
  }
  
  // 生成飞书消息
  const message = generateFeishuMessage(projects, params);
  
  // 返回消息（由上层发送到飞书）
  return message;
};

/**
 * 解析输入参数
 */
function parseParams(args) {
  // 从args或context中解析参数
  const text = args.text || args.query || args.message || '';
  
  // 解析数量
  let perPage = CONFIG.GITHUB_API.defaultPerPage;
  const countMatch = text.match(/前(\d+)/);
  if (countMatch) {
    perPage = Math.min(parseInt(countMatch[1]), 100);
  }
  
  // 解析排序方式
  let sort = CONFIG.GITHUB_API.defaultSort;
  if (text.includes('最新') || text.includes('updated')) {
    sort = 'updated';
  } else if (text.includes('fork') || text.includes('分支')) {
    sort = 'forks';
  }
  
  return {
    sort,
    per_page: perPage,
    topic: CONFIG.GITHUB_API.defaultTopic
  };
}

/**
 * 获取GitHub热门项目数据
 * 使用GitHub公开API，无需认证
 */
async function fetchGitHubTrending(params) {
  const { sort, per_page, topic } = params;
  
  // 构建API URL
  const apiUrl = `${CONFIG.GITHUB_API.baseUrl}?q=topic:${topic}+created:>${CONFIG.GITHUB_API.minCreated}&sort=${sort}&order=desc&per_page=${per_page}`;
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'OpenClaw-GitHub-Feishu-Skill/2.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`GitHub API错误: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    return (data.items || []).map(item => ({
      name: item.name,
      fullName: item.full_name,
      stars: item.stargazers_count,
      forks: item.forks_count,
      description: item.description || '无描述',
      language: item.language || '未知',
      url: item.html_url,
      topics: item.topics || [],
      license: item.license?.name || '未知',
      owner: item.owner.login,
      ownerUrl: item.owner.html_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      pushedAt: item.pushed_at,
      size: item.size,
      openIssues: item.open_issues_count,
      watchers: item.watchers_count
    }));
    
  } catch (error) {
    console.error('获取数据失败:', error);
    return [];
  }
}

/**
 * 生成飞书消息格式
 */
function generateFeishuMessage(projects, params) {
  const date = new Date().toLocaleDateString(CONFIG.FORMAT.dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let msg = `📊 **GitHub 热门 AI 项目简报**\n`;
  msg += `📅 ${date}\n\n`;
  msg += `---\n\n`;
  
  // 头部信息
  msg += `**🔍 搜索条件**: ${params.topic} | **📈 排序**: ${params.sort} | **📊 数量**: ${projects.length}\n\n`;
  msg += `---\n\n`;
  
  // Top 10 项目
  msg += `## 🔥 Top ${projects.length} 热门 AI 项目\n\n`;
  
  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  
  projects.forEach((p, i) => {
    const medal = medals[i] || `${i + 1}.`;
    
    msg += `### ${medal} **${p.name}**\n`;
    msg += `   ⭐ **${formatNumber(p.stars)}** | 🍴 **${formatNumber(p.forks)}** | 👁️ **${formatNumber(p.watchers)}**\n\n`;
    
    // 描述（截断处理）
    let desc = p.description;
    if (desc.length > CONFIG.FORMAT.maxDescriptionLength) {
      desc = desc.substring(0, CONFIG.FORMAT.maxDescriptionLength) + '...';
    }
    msg += `   📝 ${desc}\n\n`;
    
    // 技术栈
    msg += `   💻 技术栈: ${p.language} | 👤 作者: ${p.owner} | 📜 许可证: ${p.license}\n`;
    
    // 链接
    msg += `   🔗 链接: ${p.url}\n`;
    
    // 关键词
    if (p.topics.length > 0) {
      const topics = p.topics.slice(0, CONFIG.FORMAT.showTopicsMax).join(', ');
      msg += `   🏷️ 标签: ${topics}\n`;
    }
    
    msg += `\n`;
  });
  
  // 技术洞察
  msg += `---\n\n`;
  msg += `## 💡 技术洞察\n\n`;
  
  // 统计技术栈
  const languages = {};
  projects.forEach(p => {
    languages[p.language] = (languages[p.language] || 0) + 1;
  });
  
  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  msg += `• **技术栈分布**: ${topLanguages.map(([lang, count]) => `${lang}(${count})`).join(' | ')}\n`;
  msg += `• **总Star数**: ${formatNumber(projects.reduce((sum, p) => sum + p.stars, 0))}\n`;
  msg += `• **总Fork数**: ${formatNumber(projects.reduce((sum, p) => sum + p.forks, 0))}\n\n`;
  
  msg += `---\n\n`;
  msg += `*🤖 由 OpenClaw 自动生成*`;
  
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
  return num.toLocaleString();
}
