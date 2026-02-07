import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStrategy, PaymentResult } from './interfaces/payment-strategy.interface';
import { MockPaymentStrategy } from './strategies/mock-payment.strategy';

@Injectable()
export class PaymentService {
  private strategy: PaymentStrategy;

  constructor(private readonly mockPaymentStrategy: MockPaymentStrategy) {
    // Default strategy. In a real app, this could be selected dynamically based on user choice or config.
    this.strategy = mockPaymentStrategy;
  }

  setStrategy(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  async processPayment(amount: number, metadata?: any): Promise<PaymentResult> {
    if (!this.strategy) {
      throw new BadRequestException('Payment strategy not set');
    }
    return this.strategy.processPayment(amount, metadata);
  }
}
