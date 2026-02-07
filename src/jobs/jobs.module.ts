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
    ),
  ],
  providers: [],
  exports: [],
})
export class JobsModule {}
