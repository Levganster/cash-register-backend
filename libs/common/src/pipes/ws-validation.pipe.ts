import { Injectable, ValidationPipe } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { ValidationError } from 'class-validator';

@Injectable()
export class WsValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }

  createExceptionFactory() {
    return (validationErrors: ValidationError[] = []) => {
      const errors = this.formatErrors(validationErrors);
      return new WsException({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    };
  }

  private formatErrors(errors: ValidationError[]) {
    return errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints || {});
      if (err.children?.length) {
        acc[err.property] = this.formatErrors(err.children);
      }
      return acc;
    }, {});
  }
}
