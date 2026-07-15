const fs = require('fs');
const path = require('path');

const files = [
  'app/create/edit/[id]/page.tsx',
  'app/create/edit/[id]/chapters/[chapterId]/page.tsx',
  'app/create/edit/[id]/chapters/page.tsx',
  'app/create/page.tsx',
  'components/Navbar.tsx',
  'app/actions/story.ts',
  'app/story/[id]/page.tsx'
];

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/orel@gmail\.com/g, 'doron_admainDB@gmail.com');
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${relPath}`);
  } else {
    console.log(`File not found: ${relPath}`);
  }
}
