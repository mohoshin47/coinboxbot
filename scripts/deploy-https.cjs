#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
  const distDir = path.join(__dirname, '..', 'dist');
  const gitCacheDir = path.join(require('os').tmpdir(), 'gh-pages-coinboxbot');
  const repoUrl = 'https://github.com/mohoshin47/coinboxbot.git';
  const branch = 'gh-pages';

  console.log('Starting deployment...');
  console.log('Source directory:', distDir);
  console.log('Repository:', repoUrl);
  console.log('Target branch:', branch);

  // Clean up old cache
  if (fs.existsSync(gitCacheDir)) {
    console.log('Removing old cache...');
    execSync(`rmdir /s /q "${gitCacheDir}"`, { stdio: 'inherit', shell: 'cmd' });
  }

  // Create new cache directory
  console.log('Creating cache directory...');
  fs.mkdirSync(gitCacheDir, { recursive: true });

  // Clone the repository with the gh-pages branch
  console.log(`Cloning ${branch} branch...`);
  execSync(`git clone --depth 1 --branch ${branch} ${repoUrl} "${gitCacheDir}"`, {
    stdio: 'inherit',
    shell: 'cmd',
  });

  // Copy dist files to the repository
  console.log('Copying files...');
  const distFiles = getAllFiles(distDir);
  for (const file of distFiles) {
    const source = path.join(distDir, file);
    const target = path.join(gitCacheDir, file);
    const targetDir = path.dirname(target);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(source, target);
  }

  // Git add and commit
  console.log('Committing changes...');
  execSync(`git add -A`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  // Check if there are changes to commit
  try {
    execSync(`git diff --cached --quiet`, {
      cwd: gitCacheDir,
      shell: 'cmd',
    });
    console.log('No changes to commit.');
    process.exit(0);
  } catch (e) {
    // There are changes, proceed with commit
  }

  execSync(`git commit -m "Deploy: $(date)"`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  // Push to repository
  console.log('Pushing to repository...');
  execSync(`git push origin ${branch}`, {
    cwd: gitCacheDir,
    stdio: 'inherit',
    shell: 'cmd',
  });

  console.log('Deployment successful!');
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}

function getAllFiles(dir) {
  const files = [];

  function traverse(currentDir, prefix = '') {
    const entries = fs.readdirSync(currentDir);
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const relativePath = prefix ? `${prefix}/${entry}` : entry;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        traverse(fullPath, relativePath);
      } else {
        files.push(relativePath);
      }
    }
  }

  traverse(dir);
  return files;
}
