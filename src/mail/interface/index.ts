import { Request } from 'express';
import Mail from 'nodemailer/lib/mailer';

export interface MailOptionsAttributeI {
  to: string;
  from?: string;
  subject: string;
  body?: string;
  templateName?: string;
  replacements?: Record<string, any>;
  attachments?: Mail.Attachment[];
  cc?: string | string[];
  bcc?: string | string[];
}
