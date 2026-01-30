import { execSync } from 'child_process';

try {
  console.log('Running type-check...');
  execSync('npm run type-check', { stdio: 'inherit' });
  
  // console.log('Running lint...');
  // execSync('npm run lint', { stdio: 'inherit' });
  
  console.log('Running build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Health check passed!');
} catch (error) {
  console.error('❌ Health check failed:', error.message);
  process.exit(1);
}
