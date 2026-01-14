import fs from 'fs';
import path from 'path';

const indexPath = path.resolve('build/index.html');
const initScriptPath = path.resolve('build/init.js');

try {
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf-8');
    
    // Extract inline script content
    const scriptMatch = content.match(/<script>\s*\{([\s\S]*?)\}\s*<\/script>/);
    
    if (scriptMatch) {
      let scriptContent = scriptMatch[1];
      
      // Fix paths in script (change /app/ to ./app/)
      scriptContent = scriptContent.replace(/import\("\//g, 'import("./');
      
      // Fix the element reference - use document.getElementById instead
      scriptContent = scriptContent.replace(
        'const element = document.currentScript.parentElement;',
        'const element = document.getElementById("app");'
      );
      
      // Make the sveltekit variable global by assigning to window
      // Match pattern like __sveltekit_xyz = 
      scriptContent = scriptContent.replace(
        /(__sveltekit_\w+)\s*=\s*\{/,
        'window.$1 = {'
      );
      
      // Write to external file (no IIFE wrapper needed now)
      fs.writeFileSync(initScriptPath, scriptContent.trim());
      console.log('✅ Created init.js from inline script');
      
      // Replace inline script with external script reference
      content = content.replace(
        /<div style="display: contents">\s*<script>[\s\S]*?<\/script>\s*<\/div>/,
        '<div id="app"></div>\n\t\t<script type="module" src="init.js"></script>'
      );
    }
    
    // Fix absolute paths in HTML
    content = content
      .replace(/href="\//g, 'href="')
      .replace(/src="\//g, 'src="');
      
    fs.writeFileSync(indexPath, content);
    console.log('✅ Fixed index.html for Chrome extension');
  } else {
    console.log('⚠️ index.html not found');
  }
} catch (err) {
  console.error('Error:', err);
}
