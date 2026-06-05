const https = require('https');

const slugs = ['netflix', 'amazon', 'meta', 'slack', 'google', 'apple', 'spotify', 'microsoft', 'figma', 'airbnb', 'adobe', 'uber'];

function fetchSvg(slug) {
  return new Promise((resolve, reject) => {
    const url = `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const match = data.match(/d="([^"]+)"/);
          if (match) {
            resolve({ slug, path: match[1] });
          } else {
            reject(new Error(`No path found for ${slug}`));
          }
        } else {
          reject(new Error(`Status ${res.statusCode} for ${slug}`));
        }
      });
    }).on('error', (err) => reject(err));
  });
}

async function main() {
  for (const slug of slugs) {
    try {
      const result = await fetchSvg(slug);
      console.log(`SLUG:${result.slug} PATH:${result.path}`);
    } catch (err) {
      console.error(`ERROR:${slug} - ${err.message}`);
    }
  }
}

main();
