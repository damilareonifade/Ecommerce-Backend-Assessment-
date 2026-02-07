import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, UpdatePaymentStatusDto } from './dto/update-order-status.dto';
import { Order, OrderStatus, PaymentStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/entities/product.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { User } from '../user/entities/user.entities';

import { NotificationService } from '../notification/notification.service';

import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
    private readonly paymentService: PaymentService,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { shippingAddress, notes } = createOrderDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await this.cartService.getCart(userId);

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];
      for (const item of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' }, // Lock product row
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.product.name} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          );
        }

        // Deduct Stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);

        const orderItem = new OrderItem();
        orderItem.productId = item.productId;
        orderItem.productName = product.name;
        orderItem.price = product.price;
        orderItem.quantity = item.quantity;
        orderItem.subtotal = Number(product.price) * item.quantity;
        
        totalAmount += orderItem.subtotal;
        orderItems.push(orderItem);
      }

      // 3. Create Order
      const order = queryRunner.manager.create(Order, {
        userId,
        shippingAddress,
        notes,
        totalAmount,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        items: orderItems,
      });

      const savedOrder = await queryRunner.manager.save(order);

      await queryRunner.manager.delete(CartItem, { cartId: cart.id });

      await queryRunner.commitTransaction();

      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      
      if (user) {
          await this.notificationService.sendEmail({
              to: user.email,
              subject: `Order Confirmation #${savedOrder.id}`,
              body: `Thank you for your order! Total: $${savedOrder.totalAmount}`,
              template: 'order-confirmation',
              context: {
                  orderId: savedOrder.id,
                  total: savedOrder.totalAmount,
                  items: savedOrder.items 
              }
          });
      }

      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['items'],
    });
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, updateOrderStatus: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    order.status = updateOrderStatus.status;
    return this.orderRepository.save(order);
  }

  async checkout(id: string) {
    const order = await this.findOne(id);
    
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
        throw new BadRequestException('Order already paid');
    }

    // Use Payment Service (Strategy Pattern)
    const result = await this.paymentService.processPayment(Number(order.totalAmount), { orderId: order.id });

    if (!result.success) {
      order.paymentStatus = PaymentStatus.FAILED;
      await this.orderRepository.save(order);
      throw new BadRequestException(`Payment failed: ${result.message}`);
    }

    order.paymentStatus = PaymentStatus.COMPLETED;
    order.status = OrderStatus.PAID;
    order.paymentReference = result.transactionId ?? null;
    
    return this.orderRepository.save(order);
  }
}
