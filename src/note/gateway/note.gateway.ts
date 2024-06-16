import { ECommonStatuses } from '@/utils/enums'
import {
    WebSocketServer,
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayConnection,
    OnGatewayInit,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { NoteService } from '../note.service'
import { EInitialSocketEvents, ENoteEvents } from './enums'
import type { IInitialSocketEventEmits } from './interfaces'
import { ESocketNamespaces } from './enums'
import { EAuthMessages, ENoteBroadcastMessages } from '@/utils/messages'
import type { TJWTPayload } from '@/auth/types'
import * as cookie from 'cookie'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EClientCookieNames } from '@/utils/enums'
import { JWTService } from '@/auth/jwt.service'
import { BroadcastNoteTypingDTO } from './dtos'
import type { TBroadcastNoteTypingRes } from './types'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { WsExceptionsFilter } from './filters'
import { extractNoteUniqueNameFromURL } from '@/utils/helpers'

@WebSocketGateway({ namespace: ESocketNamespaces.EDIT_NOTE })
@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
export class NoteGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>
{
    @WebSocketServer()
    server: Server

    constructor(
        private noteService: NoteService,
        private jwtService: JWTService,
    ) {}

    afterInit(serverInit: Server): void {
        serverInit.use(async (socket, next) => {
            const { referer } = socket.handshake.headers
            if (!referer) {
                next(new BaseCustomException(EAuthMessages.FAIL_TO_AUTH))
                return
            }
            const noteUniqueName = extractNoteUniqueNameFromURL(referer)
            const note = await this.noteService.findNote(noteUniqueName)
            if (!note) {
                next(new BaseCustomException(EAuthMessages.FAIL_TO_AUTH))
                return
            }
            if (!note.password) {
                next()
                return
            }
            const clientCookie = socket.handshake.headers.cookie
            if (!clientCookie) {
                next(new BaseCustomException(EAuthMessages.INVALID_CREDENTIALS))
                return
            }
            const parsed_cookie = cookie.parse(clientCookie) as TJWTPayload
            const jwt = parsed_cookie[EClientCookieNames.JWT_TOKEN_AUTH]
            let jwtPayload: TJWTPayload
            try {
                jwtPayload = await this.jwtService.verifyToken(jwt)
            } catch (error) {
                next(new BaseCustomException(EAuthMessages.FAIL_TO_AUTH))
                return
            }
            if (jwtPayload.noteUniqueName !== noteUniqueName) {
                next(new BaseCustomException(EAuthMessages.FAIL_TO_AUTH))
                return
            }
            next()
        })
    }

    handleConnection(socket: Socket<IInitialSocketEventEmits>): void {
        socket.emit(EInitialSocketEvents.CLIENT_CONNECTED, {
            connectionStatus: ECommonStatuses.SUCCESS,
        })
    }

    handleDisconnect(socket: Socket<IInitialSocketEventEmits>): void {}

    @SubscribeMessage(ENoteEvents.NOTE_TYPING)
    async handleNoteFormChanged(
        @MessageBody() data: BroadcastNoteTypingDTO,
        @ConnectedSocket() clientSocket: Socket,
    ): Promise<TBroadcastNoteTypingRes> {
        const { referer } = clientSocket.handshake.headers
        if (referer) {
            const noteUniqueName = extractNoteUniqueNameFromURL(referer)
            try {
                await this.noteService.updateNoteForm(noteUniqueName, data)
            } catch (error) {
                throw new WsException(error.message)
            }
        } else {
            throw new WsException(ENoteBroadcastMessages.INVALID_INPUT)
        }
        clientSocket.broadcast.emit(ENoteEvents.NOTE_TYPING, data)
        return { data, success: true }
    }
}
