import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { Job } from 'bullmq';

@Injectable()
@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    // private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.name}`);

    // Example usage
    await this.mailService.sendMail({
      to: job.data.email,
      subject: job.data.subject,
      body: job.data.body,
    });
  }
}
