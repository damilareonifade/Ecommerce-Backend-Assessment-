import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  constructor(@InjectQueue('notifications') private readonly notificationQueue: Queue) {}

  async sendEmail(data: { to: string; subject: string; body: string; template?: string; context?: any }) {
    await this.notificationQueue.add('send-email', data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
    });
  }
}
