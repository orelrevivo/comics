const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'app/actions/story.ts');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/orel@gmail\.com/g, 'doron_admainDB@gmail.com');
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
