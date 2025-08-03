const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Check command line arguments for format preference
const args = process.argv.slice(2);
const useRichFormat = !args.includes('--simple');

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
      
      // Get language if available
      const language = $(element).find('[itemprop="programmingLanguage"]').text().trim();
      
      // Get avatar URL
      const avatarUrl = `https://github.com/${owner}.png?size=40`;
      
      // Get repository social preview image
      const socialImageUrl = `https://opengraph.githubassets.com/1/${repoName}`;

      repos.push({
        name: repoName,
        owner,
        repo,
        url: repoUrl,
        description,
        stars,
        language,
        avatarUrl,
        socialImageUrl
      });
    });

    let message;
    
    if (useRichFormat) {
      // Create a message formatted for Rocket.Chat with rich attachments and images
      const attachments = repos.slice(0, 10).map((repo, idx) => {
        const languageIcon = repo.language ? `🔸 ${repo.language}` : '';
        
        return {
          color: '#24292e',
          title: `${idx + 1}. ${repo.name}`,
          title_link: repo.url,
          text: repo.description,
          thumb_url: repo.avatarUrl,
          image_url: repo.socialImageUrl,
          fields: [
            {
              title: 'Stars',
              value: `⭐ ${repo.stars}`,
              short: true
            },
            {
              title: 'Language',
              value: languageIcon || 'N/A',
              short: true
            }
          ],
          footer: `GitHub • ${repo.owner}`,
          footer_icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        };
      });

      message = {
        text: '🔥 **GitHub Trending Repositories**',
        attachments: attachments
      };
    } else {
      // Simple text format with inline images (fallback)
      const textLines = repos.slice(0, 10).map((repo, idx) => {
        const languageText = repo.language ? ` • ${repo.language}` : '';
        return `${idx + 1}. ![${repo.owner}](${repo.avatarUrl}) [${repo.name}](${repo.url}) ⭐ ${repo.stars}${languageText}\n> ${repo.description}`;
      });

      message = {
        text: `🔥 **GitHub Trending Repositories**\n\n${textLines.join('\n\n')}`
      };
    }

    fs.writeFileSync('message.json', JSON.stringify(message, null, 2), 'utf-8');
    console.log(`Message file created successfully using ${useRichFormat ? 'rich' : 'simple'} format.`);
  } catch (error) {
    console.error('Error fetching trending repos:', error);
    process.exit(1);
  }
}

fetchTrendingRepos();
