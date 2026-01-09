import * as nodemailer from 'nodemailer';

export class MailUtil {
  private static readonly transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE,
    // host: process.env.SMTP_HOST,
    // port: Number(process.env.SMTP_PORT),
    // secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  static async sendMail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"Rent Management" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}
