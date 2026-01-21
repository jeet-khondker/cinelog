import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false, // 587番ポートの場合は false
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail({
        from: '"シネログサポートチーム" <support@cinelog.com>',
        to,
        subject,
        html,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log('メッセージを送信しました: %s', info.messageId);
      // Etherealの場合、ここにテストメール確認用のURLが表示されます
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      console.log('プレビューURL: %s', nodemailer.getTestMessageUrl(info));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return info;
    } catch (error) {
      console.error('メール送信エラー:', error);
      throw error;
    }
  }
}
