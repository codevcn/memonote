import { ECommonStatuses, EInitialSocketEvents, ESocketNamespaces } from '../utils/constants.js'
import { UseFilters, UsePipes } from '@nestjs/common'
import {
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayConnection,
    OnGatewayInit,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces.js'
import { AuthService } from '../auth/auth.service.js'
import { OnEvent } from '@nestjs/event-emitter'
import { EEventEmitterEvents, ENotificationEvents } from './constants.js'
import type { TAuthSocketConnection } from '../auth/types.js'
import { WsExceptionsFilter } from '../utils/exception/gateway.filter.js'
import { initGatewayMetadata } from '../configs/config-gateways.js'
import { wsValidationPipe } from '../configs/config-validation.js'
import { BaseCustomEmittedEvent } from '../utils/custom.events.js'
import { TNotifWithTrans } from './types.js'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NOTIFICATION }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private server: Server

    constructor(private authService: AuthService) {}

    afterInit(server: Server): void {
        server.use(async (socket, next) => {
            let result: TAuthSocketConnection
            try {
                result = await this.authService.authSocketConnection(socket)
            } catch (error) {
                return next(error)
            }
            socket.join(result.noteUniqueName)
            next()
        })
        this.server = server
    }

    handleConnection(socket: Socket<IInitialSocketEventEmits>): void {
        socket.emit(EInitialSocketEvents.CLIENT_CONNECTED, {
            connectionStatus: ECommonStatuses.SUCCESS,
        })
    }

    handleDisconnect(socket: Socket<IInitialSocketEventEmits>): void {}

    @OnEvent(EEventEmitterEvents.TRIGGER_NOTIFY)
    notify(event: BaseCustomEmittedEvent<TNotifWithTrans>) {
        const { noteUniqueName, translation } = event.payload
        this.server.to(noteUniqueName).emit(ENotificationEvents.NOTIFY, { translation })
    }
}
