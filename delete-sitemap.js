const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src', 'app', 'sitemap.ts');
try {
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
    console.log('Successfully deleted ' + target);
  } else {
    console.log('File does not exist: ' + target);
  }
} catch (err) {
  console.error('Error deleting file:', err);
}
