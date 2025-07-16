import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class RemovePasswordInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map(async (data) => this.removePassword(data)));
  }

  private async removePassword(data: any): Promise<any> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.removePasswordFromItem(item)));
    }
    return this.removePasswordFromItem(data);
  }

  private async removePasswordFromItem(item: any): Promise<any> {
    if (item?.password) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = item;
      return rest;
    }
    return item;
  }
}
