const fs = require('fs');

const filePath = process.argv[2] || 'android/app/build.gradle';
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("storeFile file('upload-keystore.jks')")) {
  const releaseSigningConfigs = `
                  release {
                      storeFile file('upload-keystore.jks')
                      storePassword System.getenv('MYAPP_UPLOAD_STORE_PASSWORD')
                      keyAlias System.getenv('MYAPP_UPLOAD_KEY_ALIAS')
                      keyPassword System.getenv('MYAPP_UPLOAD_KEY_PASSWORD')
                  }
          `;
  content = content.replace('signingConfigs {', 'signingConfigs {' + releaseSigningConfigs);
}

// IMPORTANT: String.replace(string) only replaces the FIRST match.
// Virgin Expo gradle has debug THEN release both using signingConfigs.debug.
// Replacing only the first left release signed with debug.keystore (SHA1 5E:8F...).
// Target the release buildType via its unique RN caution comment.
const marker = 'see https://reactnative.dev/docs/signed-apk-android.';
const idx = content.indexOf(marker);
if (idx === -1) {
  throw new Error('Could not find release buildType marker in build.gradle');
}
const head = content.slice(0, idx);
const tail = content.slice(idx);
if (!tail.includes('signingConfig signingConfigs.debug')) {
  throw new Error('Release buildType is not using signingConfigs.debug as expected');
}
content =
  head +
  tail.replace(
    'signingConfig signingConfigs.debug',
    'signingConfig signingConfigs.release'
  );

if (!content.includes('signingConfig signingConfigs.release')) {
  throw new Error('Failed to set release signingConfig to signingConfigs.release');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Release buildType now uses signingConfigs.release');
