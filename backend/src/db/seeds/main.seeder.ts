import { DataSource } from 'typeorm';
import { Seeder, runSeeders } from 'typeorm-extension';
import { ApplicationSeeder } from './application.seeder';
import { UserSeeder } from './user.seeder';

export class MainSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    await runSeeders(dataSource, {
      seeds: [UserSeeder, ApplicationSeeder],
    });
  }
}
