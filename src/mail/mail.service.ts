import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import { MailOptionsAttributeI } from './interface';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter<SMTPPool.SentMessageInfo> | any;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport(this.getTransportConfig());
  }

  /**
   * Create SMTP transport configuration
   * Supports both `service` and `host + port`
   */
  private getTransportConfig() {
    const service = this.configService.get<string>('EMAIL_SERVICE');

    const auth = {
      user: this.configService.get<string>('EMAIL_USER'),
      pass: this.configService.get<string>('EMAIL_PASSWORD'),
    };

    if (!auth.user || !auth.pass) {
      throw new Error('EMAIL_USER or EMAIL_PASSWORD is missing');
    }

    // Use service (Gmail, Outlook, etc.)
    if (service) {
      return {
        service,
        auth,
        pool: true,
      };
    }

    // Use host + port (SES, SendGrid, Mailgun SMTP)
    return {
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<number>('EMAIL_PORT') === 465,
      auth,
      pool: true,
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
    };
  }

  /**
   * Send an email
   */
  async sendMail(options: MailOptionsAttributeI) {
    const senderName =
      options.from || this.configService.get<string>('EMAIL_SENDER');

    if (!senderName) {
      throw new BadRequestException('EMAIL_SENDER is not configured');
    }

    const mailData: Mail.Options = {
      from: `${senderName} <${this.configService.get<string>('EMAIL_USER')}>`,
      to: options.to,
      subject: options.subject,
      cc: options.cc,
      bcc: options.bcc,
      attachments: options.attachments,
    };

    // Build email body
    if (options.templateName) {
      mailData.html = await this.renderTemplate(
        options.templateName,
        options.replacements,
      );
    } else if (options.body) {
      mailData.html = options.body;
    } else {
      throw new BadRequestException('Email body or template is required');
    }

    return this.sendWithRetry(mailData);
  }

  /**
   * Render Handlebars template
   */
  private async renderTemplate(
    templateName: string,
    replacements: Record<string, any> = {},
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'src',
      'resources',
      'templates',
      `${templateName}.html`,
    );

    try {
      const source = await fs.readFile(templatePath, 'utf-8');
      return Handlebars.compile(source)(replacements);
    } catch (error) {
      this.logger.error(`Template not found: ${templateName}`);
      throw new BadRequestException('Email template not found');
    }
  }

  /**
   * Send email with retry logic
   */
  private async sendWithRetry(
    mailData: Mail.Options,
    retries = 2,
  ): Promise<SMTPPool.SentMessageInfo> {
    try {
      const info = await this.transporter.sendMail(mailData);

      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Email sent: ${info.messageId}`);
      }

      return info;
    } catch (error: any) {
      if (
        retries > 0 &&
        error?.message?.includes('Concurrent connections limit exceeded')
      ) {
        this.logger.warn(`Retrying email send (${retries} retries left)...`);

        await this.delay(2000);
        return this.sendWithRetry(mailData, retries - 1);
      }

      this.logger.error('Failed to send email', error);
      throw error;
    }
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
