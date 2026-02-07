import ormConfig from '../orm.config';
import { seedUsers } from './user.seeder';
import { seedProducts } from './product.seeder';

async function runSeeders() {
  const dataSource = await ormConfig.initialize();

  try {
    console.log(' Starting database seeding...');

    await seedUsers(dataSource);
    await seedProducts(dataSource);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1); // Exit with error code
  } finally {
    await dataSource.destroy();
    console.log(' Database connection closed');
  }
}

runSeeders();
