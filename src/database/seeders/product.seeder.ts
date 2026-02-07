import { DataSource } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { ulid } from 'ulid';

export async function seedProducts(dataSource: DataSource) {
  const repository = dataSource.getRepository(Product);

  const products = [
    {
      name: 'MacBook Pro 16"',
      description: 'M3 Max, 64GB RAM, 1TB SSD',
      price: 3499.00,
      stock: 50,
      category: 'Electronics',
      imageUrl: 'https://example.com/macbook.jpg',
      isActive: true,
    },
    {
      name: 'iPhone 15 Pro',
      description: 'Titanium, 256GB, Black',
      price: 1099.00,
      stock: 100,
      category: 'Electronics',
      imageUrl: 'https://example.com/iphone.jpg',
      isActive: true,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Noise cancelling headphones',
      price: 398.00,
      stock: 200,
      category: 'Audio',
      imageUrl: 'https://example.com/sony.jpg',
      isActive: true,
    },
    {
      name: 'Samsung Odyssey G9',
      description: '49" Curved Gaming Monitor',
      price: 1299.99,
      stock: 20,
      category: 'Electronics',
      imageUrl: 'https://example.com/monitor.jpg',
      isActive: true,
    },
    {
      name: 'Herman Miller Aeron',
      description: 'Ergonomic Office Chair',
      price: 1500.00,
      stock: 15,
      category: 'Furniture',
      imageUrl: 'https://example.com/chair.jpg',
      isActive: true,
    },
  ];

  for (const productData of products) {
    const exists = await repository.findOneBy({ name: productData.name });
    if (!exists) {
      const product = repository.create({
        id: ulid(),
        ...productData,
      });
      await repository.save(product);
    }
  }

  console.log('✅ Products seeded successfully');
}
