const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  const faviconSvg = fs.readFileSync('d:/Employee Management System/public/favicon.svg');
  const logoSvg = fs.readFileSync('d:/Employee Management System/public/images/logo.svg');
  const logoWhiteSvg = fs.readFileSync('d:/Employee Management System/public/images/logo-white.svg');

  console.log('Rendering raster assets...');

  // 1. App icons
  await sharp(faviconSvg).resize(512, 512).png().toFile('d:/Employee Management System/public/icons/icon-512.png');
  await sharp(faviconSvg).resize(192, 192).png().toFile('d:/Employee Management System/public/icons/icon-192.png');
  await sharp(faviconSvg).resize(180, 180).png().toFile('d:/Employee Management System/app/apple-icon.png');
  await sharp(faviconSvg).resize(48, 48).png().toFile('d:/Employee Management System/app/icon.png');
  await sharp(faviconSvg).resize(32, 32).png().toFile('d:/Employee Management System/public/icons/icon-32.png');
  await sharp(faviconSvg).resize(16, 16).png().toFile('d:/Employee Management System/public/icons/icon-16.png');

  // 2. High-res logo PNGs
  await sharp(logoSvg).resize(1200, 313, { fit: 'inside' }).png().toFile('d:/Employee Management System/public/images/logo.png');
  await sharp(logoWhiteSvg).resize(1200, 313, { fit: 'inside' }).png().toFile('d:/Employee Management System/public/images/logo-dark.png');

  console.log('PNG assets rendered! Now generating multi-size ICO with Python...');

  execSync(`python -c "
from PIL import Image

img_512 = Image.open(r'd:\\Employee Management System\\public\\icons\\icon-512.png')
# Save multi-size favicon.ico
img_512.save(r'd:\\Employee Management System\\public\\favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
img_512.save(r'd:\\Employee Management System\\app\\favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
print('Favicon.ico multi-resolution generated!')
"`, { stdio: 'inherit' });

  console.log('All brand icon assets successfully generated!');
}

main().catch(console.error);
