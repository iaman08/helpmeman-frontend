import urllib.request
import re

slugs = ['netflix', 'amazon', 'meta', 'slack', 'google', 'apple', 'spotify', 'microsoft', 'figma', 'airbnb', 'adobe', 'uber']
for slug in slugs:
    url = f"https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/{slug}.svg"
    try:
        with urllib.request.urlopen(url) as response:
            svg = response.read().decode('utf-8')
            # Extract path d="..."
            match = re.search(r'd="([^"]+)"', svg)
            if match:
                print(f"slug: '{slug}', path: '{match.group(1)}'")
            else:
                print(f"slug: '{slug}' path not found in svg: {svg[:100]}")
    except Exception as e:
         print(f"error {slug}: {e}")
