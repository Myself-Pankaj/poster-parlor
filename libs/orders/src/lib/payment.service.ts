import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '@poster-parlor-api/config';
import { BadRequestException } from '@poster-parlor-api/utils';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export interface CreatePaymentOrderDto {
  amount: number; // Amount in paise (INR * 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface VerifyPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResult {
  isValid: boolean;
  orderId: string;
  paymentId: string;
}

@Injectable()
export class PaymentService {
  private razorpay: Razorpay;
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly configService: AppConfigService) {
    const { razorpayKeyId, razorpayKeySecret } =
      this.configService.paymentConfig;

    this.razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    this.logger.log('Razorpay payment service initialized');
  }

  /**
   * Get Razorpay Key ID for frontend
   */
  getKeyId(): string {
    return this.configService.paymentConfig.razorpayKeyId;
  }

  /**
   * Create a Razorpay order for payment
   * @param dto - Payment order details
   * @returns Razorpay order object
   */
  async createOrder(dto: CreatePaymentOrderDto): Promise<RazorpayOrder> {
    try {
      const options = {
        amount: Math.round(dto.amount), // Amount should already be in paise
        currency: dto.currency || 'INR',
        receipt: dto.receipt,
        notes: dto.notes || {},
      };

      this.logger.debug(
        `Creating Razorpay order: ${JSON.stringify(options, null, 2)}`
      );

      const order = (await this.razorpay.orders.create(
        options
      )) as RazorpayOrder;

      this.logger.log(`Razorpay order created: ${order.id}`);
      return order;
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw new BadRequestException(
        'Failed to create payment order. Please try again.'
      );
    }
  }

  /**
   * Verify payment signature from Razorpay callback
   * @param dto - Payment verification data
   * @returns Verification result
   */
  verifyPaymentSignature(dto: VerifyPaymentDto): PaymentVerificationResult {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = dto;

    const { razorpayKeySecret } = this.configService.paymentConfig;

    // Create the expected signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      this.logger.log(
        `Payment verified successfully: ${razorpay_payment_id} for order ${razorpay_order_id}`
      );
    } else {
      this.logger.warn(
        `Payment verification failed for order ${razorpay_order_id}`
      );
    }

    return {
      isValid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    };
  }

  /**
   * Fetch payment details from Razorpay
   * @param paymentId - Razorpay payment ID
   */
  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      this.logger.error(`Failed to fetch payment details: ${paymentId}`, error);
      throw new BadRequestException('Failed to fetch payment details');
    }
  }
}
