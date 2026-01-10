import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import { User } from 'src/user/entities/user.entities';

export async function seedUsers(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }

  // Create test users with enum roles
  const users = [
    {
      id: ulid(),
      email: 'admin@fooddelivery.com',
      password: await bcrypt.hash('Admin123!', 10),
    },
    {
      id: ulid(),
      email: 'vendor@fooddelivery.com',
      password: await bcrypt.hash('Vendor123!', 10),
    },
    {
      id: ulid(),
      email: 'customer@fooddelivery.com',
      password: await bcrypt.hash('Customer123!', 10),
    },
    {
      id: ulid(),
      email: 'rider@fooddelivery.com',
      password: await bcrypt.hash('Rider123!', 10),
    },
  ];

  await userRepository.save(users);
  console.log('✅ Users seeded successfully!');
}
