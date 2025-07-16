import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() dto: SignInDto, @Res() res: Response) {
    const tokens = await this.authService.signIn(dto);
    await this.authService.setTokensCookie(res, tokens);
    return res.json(tokens);
  }

  @Post('sign-up')
  async signUp(@Body() dto: SignUpDto, @Res() res: Response) {
    const tokens = await this.authService.signUp(dto);
    await this.authService.setTokensCookie(res, tokens);
    return res.json(tokens);
  }

  @Post('refresh')
  async refresh(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies['refreshToken'];
    const tokens = await this.authService.refresh(refreshToken);
    await this.authService.setTokensCookie(res, tokens);
    return res.json(tokens);
  }

  @Delete('logout')
  async logout(
    @Res() res: Response,
    @Req() req: Request,
    @Query('full') full: boolean = false,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    await this.authService.signOut(refreshToken, full);

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    return res.sendStatus(HttpStatus.OK);
  }
}
