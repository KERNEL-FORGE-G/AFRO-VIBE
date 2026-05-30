#!/usr/bin/env node
/**
 * npm run logo
 * Compile le logo depuis le dossier logo/ et le remplace partout dans l'app.
 * Usage : npm run logo
 */
const fs = require('fs');
const path = require('path');

const LOGO_DIR = path.join(__dirname);
const TARGETS = [
  path.join(__dirname, '..', 'src', 'assets', 'images', 'logo.jpg'),
  path.join(__dirname, '..', 'src', 'assets', 'images', 'logo_main.jpg'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-hdpi', 'ic_launcher.png'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-mdpi', 'ic_launcher.png'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-xhdpi', 'ic_launcher.png'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-xxhdpi', 'ic_launcher.png'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png'),
];

// Supported image extensions
const EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

function findLogoFile() {
  const logoPath = path.join(LOGO_DIR, 'logo.png');
  if (fs.existsSync(logoPath)) {
    return logoPath;
  }
  return null;
}

const logoFile = findLogoFile();

if (!logoFile) {
  console.error('\n❌  Aucune image trouvée dans le dossier logo/');
  console.error('    Placez votre logo (PNG, JPG, WEBP) dans le dossier logo/ puis relancez npm run logo\n');
  process.exit(1);
}

console.log(`\n🎨  Logo source détecté : ${path.basename(logoFile)}`);

let copied = 0;
let skipped = 0;

for (const target of TARGETS) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) {
    console.log(`  ⚠️  Dossier introuvable, ignoré : ${dir}`);
    skipped++;
    continue;
  }
  try {
    fs.copyFileSync(logoFile, target);
    console.log(`  ✅  Remplacé : ${path.relative(path.join(__dirname, '..'), target)}`);
    copied++;
  } catch (e) {
    console.error(`  ❌  Erreur sur ${target} : ${e.message}`);
    skipped++;
  }
}

console.log(`\n✨  Terminé ! ${copied} fichiers mis à jour, ${skipped} ignorés.`);
console.log('    Relancez npm run android pour voir les changements.\n');
