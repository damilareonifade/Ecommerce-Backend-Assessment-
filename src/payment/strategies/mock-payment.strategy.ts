import { Injectable, Logger } from '@nestjs/common';
import { PaymentStrategy, PaymentResult } from '../interfaces/payment-strategy.interface';
import { PaymentStatus } from '../../order/entities/order.entity';

@Injectable()
export class MockPaymentStrategy implements PaymentStrategy {
  private readonly logger = new Logger(MockPaymentStrategy.name);

  async processPayment(amount: number, metadata?: any): Promise<PaymentResult> {
    this.logger.log(`Processing mock payment of $${amount} for order ${metadata?.orderId}`);
    
    // Simulate API latency
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock success
    return {
      success: true,
      transactionId: `MOCK_TRX_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: PaymentStatus.COMPLETED,
      message: 'Payment processed successfully via Mock Provider',
    };
  }
}
