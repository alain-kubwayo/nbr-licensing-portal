import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { ApplicationEntity } from '../applications/application.entity';
import { AuditLogEntity } from '../audit/audit-log.entity';
import { DocumentEntity } from '../documents/document.entity';
import { UserEntity } from '../users/user.entity';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [UserEntity, ApplicationEntity, AuditLogEntity, DocumentEntity],
  synchronize: false,
  migrationsTableName: 'pg_migrations',
  migrations: ['dist/**/__migrations__/*{.ts,.js}'],
  seeds: ['dist/db/seeds/main.seeder{.ts,.js}'],
};

const AppDataSource = new DataSource(options);

export default AppDataSource;
