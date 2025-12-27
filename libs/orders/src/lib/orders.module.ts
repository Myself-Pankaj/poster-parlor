import { Module } from '@nestjs/common';

import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { PaymentService } from './payment.service';
import {
  Order,
  OrderSchema,
  Poster,
  PosterSchema,
  User,
  UserSchema,
} from '@poster-parlor-api/models';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfigModule } from '@poster-parlor-api/config';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Poster.name, schema: PosterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, PaymentService],
  exports: [OrdersService, PaymentService],
})
export class OrderModule {}
