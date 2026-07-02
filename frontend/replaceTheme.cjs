const fs = require('fs');
const path = require('path');

const replacements = {
  "purple-900": "emerald-900",
  "purple-800": "emerald-800",
  "purple-700": "emerald-700",
  "purple-600": "emerald-600",
  "purple-500": "emerald-500",
  "purple-400": "emerald-400",
  "purple-300": "emerald-300",
  "indigo-900": "emerald-900",
  "indigo-800": "emerald-800",
  "indigo-700": "emerald-700",
  "indigo-600": "emerald-600",
  "indigo-500": "emerald-500",
  "indigo-400": "emerald-400",
  "indigo-300": "emerald-300",
  "amber-500": "emerald-500",
  "amber-400": "emerald-400",
  "#5865F2": "#128C7E", // Discord blue
  "#4752C4": "#075E54", // Darker discord blue
  "#8b5cf6": "#25D366", // Purple hex
  "#6366f1": "#128C7E", // Indigo hex
  "#4f46e5": "#075E54", // Indigo dark hex
  "from-purple-500": "from-emerald-500",
  "to-indigo-500": "to-emerald-500",
  "to-purple-500": "to-emerald-500",
  "to-indigo-600": "to-emerald-600",
  "shadow-purple-500": "shadow-emerald-500",
  "ring-purple-500": "ring-emerald-500",
  "border-purple-500": "border-emerald-500",
  "text-purple-500": "text-emerald-500",
  "bg-purple-500": "bg-emerald-500",
  "hover:bg-purple-500": "hover:bg-emerald-500",
  "hover:text-purple-500": "hover:text-emerald-500",
  "focus:ring-purple-500": "focus:ring-emerald-500",
  "focus:border-purple-500": "focus:border-emerald-500",
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
    
    // Create regex from keys, sort by length descending to match longest first
    const keys = Object.keys(replacements).sort((a, b) => b.length - a.length);
    
    keys.forEach(key => {
      // replace all instances of key with its value
      content = content.split(key).join(replacements[key]);
    });
    
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated theme in ${file}`);
    }
  }
});
console.log('Theme replacement complete!');
