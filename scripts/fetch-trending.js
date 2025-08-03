const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchTrendingRepos() {
  try {
    const url = 'https://github.com/trending';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const repos = [];

    $('article.Box-row').each((_, element) => {
      const repoName = $(element).find('h2 a').text().trim().replace(/\s/g, '');
      const [owner, repo] = repoName.split('/');
      const description = $(element).find('p').text().trim();
      const stars = $(element).find('a[href$="/stargazers"]').first().text().trim();
      const repoUrl = `https://github.com/${repoName}`;
      
      // Extract additional context information
      const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim();
      const todaysStars = $(element).find('.f6.color-fg-muted .d-inline-block span').last().text().trim();
      const forks = $(element).find('a[href$="/forks"]').text().trim();
      
      // Extract more metadata from the repo page structure
      const repoFooter = $(element).find('.f6.color-fg-muted .mt-2');
      const footerText = repoFooter.text().trim();
      
      repos.push({
        name: repoName,
        url: repoUrl,
        description,
        stars,
        language: language || 'Not specified',
        todaysStars: todaysStars || '0',
        forks: forks || '0',
        owner,
        repo
      });
    });

    // Create enhanced message with more context
    const attachments = repos.slice(0, 10).map((repo, idx) => {
      // Determine language emoji
      const getLanguageEmoji = (lang) => {
        const langMap = {
          'JavaScript': '🟨',
          'TypeScript': '🔷',
          'Python': '🐍',
          'Java': '☕',
          'C++': '⚡',
          'C#': '🔷',
          'Go': '🐹',
          'Rust': '🦀',
          'Swift': '🍎',
          'Kotlin': '💜',
          'PHP': '🐘',
          'Ruby': '💎',
          'C': '⚙️',
          'HTML': '🌐',
          'CSS': '🎨',
          'Shell': '🐚',
          'Jupyter Notebook': '📓',
          'Dart': '🎯',
          'Scala': '⚖️',
          'R': '📊'
        };
        return langMap[lang] || '📝';
      };

      const languageDisplay = repo.language !== 'Not specified' 
        ? `${getLanguageEmoji(repo.language)} ${repo.language}`
        : '📝 Not specified';

      // Format today's stars growth
      const todaysGrowth = repo.todaysStars && repo.todaysStars !== '0' 
        ? `\n📈 **Trending:** +${repo.todaysStars} stars today`
        : '';

      // Enhanced description with context
      const contextualDescription = `${repo.description}${todaysGrowth}`;

      return {
        color: "#24292e",
        title: `${idx + 1}. ${repo.name}`,
        title_link: repo.url,
        text: contextualDescription,
        thumb_url: `https://github.com/${repo.owner}.png?size=40`,
        image_url: `https://opengraph.githubassets.com/1/${repo.name}`,
        fields: [
          {
            title: "Stars",
            value: `⭐ ${repo.stars}`,
            short: true
          },
          {
            title: "Language",
            value: languageDisplay,
            short: true
          },
          {
            title: "Forks", 
            value: `🍴 ${repo.forks || '0'}`,
            short: true
          },
          {
            title: "Owner",
            value: `👤 ${repo.owner}`,
            short: true
          }
        ],
        footer: `GitHub • ${repo.owner}`,
        footer_icon: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
      };
    });

    const message = {
      text: "🔥 **GitHub Trending Repositories** - Daily picks with enhanced context for better understanding",
      attachments
    };

    fs.writeFileSync('message.json', JSON.stringify(message, null, 2), 'utf-8');
    console.log('Message file created successfully.');
  } catch (error) {
    console.error('Error fetching trending repos:', error);
    process.exit(1);
  }
}

fetchTrendingRepos();
