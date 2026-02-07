import { PaymentStatus } from '../../order/entities/order.entity';

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  message?: string;
}

export interface PaymentStrategy {
  processPayment(amount: number, metadata?: any): Promise<PaymentResult>;
}
