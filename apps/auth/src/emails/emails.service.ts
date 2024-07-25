import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailsService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendConfirmationEmail(email: string, confirmationToken: string) {
    const confirmationLink = `${this.configService.get<string>('APP_URL')}/confirm-email?token=${confirmationToken}`;
    console.log(confirmationToken);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Email',
      html: `
        <h1>Email Confirmation</h1>
        <p>Thank you for registering. Please confirm your email by clicking on the following link:</p>
        <a href="${confirmationLink}">Confirm Email</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Confirmation email sent successully');
    } catch (error) {
      throw new Error(`Failed to send confirmation email: ${error} `);
    }
  }
}
