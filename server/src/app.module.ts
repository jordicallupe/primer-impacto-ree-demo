import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceModule } from './infrastructure/balance.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // lee el .env
    ConfigModule.forRoot({ isGlobal: true }),
    // conecta a PostgreSQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    // activa los cron jobs
    ScheduleModule.forRoot(),
    // todo nuestro dominio
    BalanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
