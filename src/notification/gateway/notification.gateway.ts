import { ECommonStatuses, EInitialSocketEvents, ESocketNamespaces } from '@/utils/enums'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import {
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayConnection,
    OnGatewayInit,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces'
import { AuthService } from '@/auth/auth.service'
import { BaseCustomEvent } from '@/note/gateway/events'
import { OnEvent } from '@nestjs/event-emitter'
import { EEventEmitterEvents, ENotificationEvents } from './enums'
import type { TAuthSocketConnectionReturn } from '@/auth/types'
import type { TNotificationDocument } from '../notification.model'
import { WsExceptionsFilter } from '@/utils/exception/gateway.filter'
import { initGatewayMetadata } from '@/configs/config-gateways'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NOTIFICATION }))
@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

    constructor(private authService: AuthService) {}

    afterInit(server: Server): void {
        server.use(async (socket, next) => {
            let result: TAuthSocketConnectionReturn
            try {
                result = await this.authService.authSocketConnection(socket)
            } catch (error) {
                return next(error)
            }
            socket.join(result.noteUniqueName)
            next()
        })
        this.io = server
    }

    handleConnection(socket: Socket<IInitialSocketEventEmits>): void {
        socket.emit(EInitialSocketEvents.CLIENT_CONNECTED, {
            connectionStatus: ECommonStatuses.SUCCESS,
        })
    }

    handleDisconnect(socket: Socket<IInitialSocketEventEmits>): void {}

    @OnEvent(EEventEmitterEvents.TRIGGER_NOTIFY)
    notify(event: BaseCustomEvent<TNotificationDocument>) {
        const { payload, noteUniqueName } = event
        this.io.to(noteUniqueName).emit(ENotificationEvents.NOTIFY, payload)
    }
}
