import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name.');
  process.exit(1);
}

try {
  const migrationPath = `src/db/__migrations__/${migrationName}`;
  const command = `pnpm typeorm migration:generate ${migrationPath}`;
  execSync(command, { stdio: 'inherit' });
} catch (error) {
  console.error('Error generating migration:', error);
  process.exit(1);
}
