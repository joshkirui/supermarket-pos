import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl: string;
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private readonly passkey: string;
  private readonly shortcode: string;
  private readonly callbackUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('MPESA_ENV') === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
    this.consumerKey = this.configService.get<string>('MPESA_CONSUMER_KEY', '');
    this.consumerSecret = this.configService.get<string>('MPESA_CONSUMER_SECRET', '');
    this.passkey = this.configService.get<string>('MPESA_PASSKEY', '');
    this.shortcode = this.configService.get<string>('MPESA_SHORTCODE', '');
    this.callbackUrl = this.configService.get<string>('MPESA_CALLBACK_URL', '');
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const data = await response.json();
    return data.access_token;
  }

  private generatePassword(): string {
    const timestamp = this.getTimestamp();
    const data = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(data).toString('base64');
  }

  private getTimestamp(): string {
    const now = new Date();
    return (
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0')
    );
  }

  async initiateStkPush(phoneNumber: string, amount: number, accountRef: string) {
    const accessToken = await this.getAccessToken();
    const password = this.generatePassword();
    const timestamp = this.getTimestamp();

    const body = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: accountRef,
      TransactionDesc: `POS Payment - ${accountRef}`,
    };

    this.logger.log(`STK Push initiated for ${phoneNumber}, amount: ${amount}`);

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    this.logger.log(`STK Push response: ${JSON.stringify(data)}`);
    return data;
  }

  verifyCallback(body: any): boolean {
    // In production, verify the Safaricom certificate
    // For now, just check if the callback structure is valid
    return body?.Body?.stkCallback?.MerchantRequestID !== undefined;
  }
}
