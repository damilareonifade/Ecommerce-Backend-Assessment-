import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'send-email':
        return this.handleSendEmail(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleSendEmail(data: any) {
    const { to, subject, body, template, context } = data;
    try {
        await this.mailService.sendMail({
            to,
            subject,
            body: body || ' ', // fallback
            templateName: template, // Assuming MailService supports this
            replacements: context,
        });
        this.logger.log(`Email sent to ${to}`);
    } catch (error) {
        this.logger.error(`Failed to send email to ${to}`, error);
        throw error; // Retry will handle this
    }
  }
}
