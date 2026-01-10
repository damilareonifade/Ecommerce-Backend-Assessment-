import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mail/mail.module';
import { BullModule } from '@nestjs/bullmq';
// import { JobsService } from './jobs.service';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    BullModule.registerQueue(
      {
        name: 'system-checks',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 100, // Keep last 100 failed jobs
        },
      },
      {
        name: 'notifications',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 3000,
          },
          removeOnComplete: 100,
        },
      },
      {
        name: 'remittance',
        defaultJobOptions: {
          attempts: 5, // More attempts for payment operations
          backoff: {
            type: 'exponential',
            delay: 10000, // Longer delays between attempts
          },
          removeOnComplete: 500, // Keep more payment records
          removeOnFail: 500,
        },
      },
      {
        name: 'violations',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
        },
      },
      {
        name: 'scheduled-reports',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 50,
        },
      },
    ),
  ],
  providers: [],
  exports: [],
})
export class JobsModule {}
