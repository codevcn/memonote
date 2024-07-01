import { Catch, type ArgumentsHost } from '@nestjs/common'
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets'

@Catch(WsException)
export class WsExceptionsFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.error('>>> websocket error >>>', exception)
        super.catch(exception, host)
    }
}
