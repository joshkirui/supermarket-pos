import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AuditService } from '../../modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    if (!user) return next.handle();

    const { method, url, body, ip, headers } = request;
    const action = this.getActionFromMethod(method);
    const entityType = this.getEntityTypeFromUrl(url);

    return next.handle().pipe(
      tap(async (response) => {
        if (entityType) {
          await this.auditService.log({
            userId: user.id,
            action: `${entityType.toLowerCase()}.${action}`,
            entityType,
            entityId: response?.id,
            newValues: method !== 'GET' ? body : undefined,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        }
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    const map: Record<string, string> = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
      GET: 'view',
    };
    return map[method] || 'unknown';
  }

  private getEntityTypeFromUrl(url: string): string | null {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'api') {
      const entity = parts[1];
      return entity.charAt(0).toUpperCase() + entity.slice(1, -1);
    }
    return null;
  }
}
