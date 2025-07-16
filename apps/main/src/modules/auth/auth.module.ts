import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordService } from '@app/password';
import { TokenModule } from '@app/token';
import { SessionsModule } from '@app/sessions';

@Module({
  controllers: [AuthController],
  providers: [AuthService, PasswordService],
  imports: [TokenModule, SessionsModule],
  exports: [AuthService],
})
export class AuthModule {}
