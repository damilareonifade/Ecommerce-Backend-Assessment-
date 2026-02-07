import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductService } from '../product/product.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productService: ProductService,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, isActive: true },
      relations: ['items', 'items.product'],
    });

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        isActive: true,
        items: [],
      });
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;
    const cart = await this.getCart(userId);
    const product = await this.productService.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cartItem = cart.items.find((item) => item.productId === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
      
      if (product.stock < cartItem.quantity) {
          throw new BadRequestException('Insufficient stock for total quantity');
      }
    } else {
      cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity,
        price: product.price,
      });
      cart.items.push(cartItem);
    }
    
    cartItem.price = product.price;

    await this.cartItemRepository.save(cartItem);
    
    return this.getCart(userId);
  }

  async updateQuantity(
    userId: string,
    productId: string, 
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    const product = await this.productService.findOne(productId);
    if (product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    item.quantity = updateCartItemDto.quantity;
    item.price = product.price;
    await this.cartItemRepository.save(item);

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);

    if (item) {
      await this.cartItemRepository.remove(item);
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    const cart = await this.getCart(userId);
    await this.cartItemRepository.remove(cart.items);
  }
}
