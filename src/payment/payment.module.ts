import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MockPaymentStrategy } from './strategies/mock-payment.strategy';

@Module({
  providers: [PaymentService, MockPaymentStrategy],
  exports: [PaymentService],
})
export class PaymentModule {}
