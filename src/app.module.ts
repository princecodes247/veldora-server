import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BucketModule } from './bucket/bucket.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1/veldora'),
    UserModule,
    AuthModule,
    BucketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
