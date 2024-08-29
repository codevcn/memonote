import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { Socket } from 'socket.io'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const wsData = context.switchToWs().getData()
        const req = context.switchToHttp().getRequest<Request>()
        console.log('>>> interceptor prints body >>>', { body: { express: req.body, ws: wsData } })
        return next.handle()
    }
}
