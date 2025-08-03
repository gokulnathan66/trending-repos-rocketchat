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

      repos.push({
        name: repoName,
        url: repoUrl,
        description,
        stars
      });
    });

    // Create a message formatted for Rocket.Chat
    const textLines = repos.slice(0, 10).map((repo, idx) => {
      return `${idx + 1}. [${repo.name}](${repo.url}) ⭐ ${repo.stars}\n> ${repo.description}`;
    });

    const message = {
      text: `**GitHub Trending Repositories**\n\n${textLines.join('\n\n')}`
    };

    fs.writeFileSync('message.json', JSON.stringify(message, null, 2), 'utf-8');
    console.log('Message file created successfully.');
  } catch (error) {
    console.error('Error fetching trending repos:', error);
    process.exit(1);
  }
}

fetchTrendingRepos();
