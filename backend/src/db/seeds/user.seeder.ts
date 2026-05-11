import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { UserRole } from '../../users/enums/user-role.enum';
import { UserEntity } from '../../users/user.entity';

export const SEED_USERS = {
  admin: {
    email: 'admin@nbr.rw',
    password: 'Admin@1234',
    role: UserRole.ADMIN,
  },
  applicant1: {
    email: 'applicant1@nbr.rw',
    password: 'Applicant@1234',
    role: UserRole.APPLICANT,
  },
  applicant2: {
    email: 'applicant2@nbr.rw',
    password: 'Applicant@1234',
    role: UserRole.APPLICANT,
  },
  reviewer1: {
    email: 'reviewer1@nbr.rw',
    password: 'Reviewer@1234',
    role: UserRole.REVIEWER,
  },
  reviewer2: {
    email: 'reviewer2@nbr.rw',
    password: 'Reviewer@1234',
    role: UserRole.REVIEWER,
  },
  approver: {
    email: 'approver@nbr.rw',
    password: 'Approver@1234',
    role: UserRole.APPROVER,
  },
};

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(UserEntity);

    for (const [, userData] of Object.entries(SEED_USERS)) {
      const existing = await repo.findOneBy({ email: userData.email });
      if (existing) continue;

      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = repo.create({
        email: userData.email,
        passwordHash,
        role: userData.role,
      });
      await repo.save(user);
    }
  }
}
