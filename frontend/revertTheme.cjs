const fs = require('fs');
const path = require('path');

const replacements = {
  "emerald-900": "purple-900",
  "emerald-800": "purple-800",
  "emerald-700": "purple-700",
  "emerald-600": "purple-600",
  "emerald-500": "purple-500",
  "emerald-400": "purple-400",
  "emerald-300": "purple-300",
  "teal-900": "indigo-900",
  "teal-800": "indigo-800",
  "teal-700": "indigo-700",
  "teal-600": "indigo-600",
  "teal-500": "indigo-500",
  "teal-400": "indigo-400",
  "teal-300": "indigo-300",
  "#128C7E": "#5865F2", 
  "#075E54": "#4752C4", 
  "#25D366": "#8b5cf6", 
  "from-emerald-500": "from-purple-500",
  "to-emerald-500": "to-indigo-500",
  "to-emerald-600": "to-indigo-600",
  "shadow-emerald-500": "shadow-purple-500",
  "ring-emerald-500": "ring-purple-500",
  "border-emerald-500": "border-purple-500",
  "text-emerald-500": "text-purple-500",
  "bg-emerald-500": "bg-purple-500",
  "hover:bg-emerald-500": "hover:bg-purple-500",
  "hover:text-emerald-500": "hover:text-purple-500",
  "focus:ring-emerald-500": "focus:ring-purple-500",
  "focus:border-emerald-500": "focus:border-purple-500",
  // Also some raw whatsapp greens if they exist
  "bg-[#25D366]": "bg-[#5865F2]",
  "text-[#25D366]": "text-[#5865F2]",
};

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

files.forEach(file => {
  if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    
    keys.forEach(key => {
      content = content.split(key).join(replacements[key]);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Reverted theme in ${file}`);
    }
  }
});
console.log('Theme reversion complete!');
