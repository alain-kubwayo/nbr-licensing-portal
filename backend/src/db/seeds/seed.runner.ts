import 'dotenv/config';
import { runSeeders } from 'typeorm-extension';
import AppDataSource from '../database.config';
import { MainSeeder } from './main.seeder';

AppDataSource.initialize()
  .then(async () => {
    await runSeeders(AppDataSource, { seeds: [MainSeeder] });
    console.log('Seeding complete');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
