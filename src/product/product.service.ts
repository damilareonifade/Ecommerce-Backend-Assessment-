import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto) {
    const { cursor, limit = 10, category, search } = query;
    const qb = this.productRepository.createQueryBuilder('p');

    if (category) {
      qb.andWhere('p.category = :category', { category });
    }

    if (search) {
      qb.andWhere(
        '(p.name LIKE :search OR p.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (cursor) {
      qb.andWhere('p.id < :cursor', { cursor });
    }

    // Always order by ID (ULID is time-sortable)
    qb.orderBy('p.id', 'DESC')
      .take(limit + 1);

    const items = await qb.getMany();
    let hasNextPage = false;
    let nextCursor: string | null = null;

    if (items.length > limit) {
      hasNextPage = true;
      items.pop(); // Remove the extra item used to check for next page
      nextCursor = items[items.length - 1].id;
    }

    return {
      data: items,
      meta: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
