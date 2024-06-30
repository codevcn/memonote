import { ECommonStatuses } from '@/utils/enums'
import {
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
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { JWTService } from '@/auth/jwt.service'
import { BroadcastNoteTypingDTO } from './dtos'
import type { TBroadcastNoteTypingRes } from './types'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { WsExceptionsFilter } from './filters'
import { Helpers } from '@/utils/helpers'
import { BaseSessions } from './sessions'

@WebSocketGateway({ namespace: ESocketNamespaces.EDIT_NOTE })
@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
export class NoteGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>
{
    private io: Server

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
            const noteUniqueName = Helpers.extractNoteUniqueNameFromURL(referer)
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
            const jwt = this.jwtService.extractJWTFromCookie(clientCookie)
            if (!jwt) {
                next(new BaseCustomException(EAuthMessages.INVALID_CREDENTIALS))
                return
            }
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
            socket.join(noteUniqueName)
            BaseSessions.addUserSession(noteUniqueName, jwt)
            next()
        })

        this.io = serverInit
    }

    handleConnection(socket: Socket<IInitialSocketEventEmits>): void {
        socket.emit(EInitialSocketEvents.CLIENT_CONNECTED, {
            connectionStatus: ECommonStatuses.SUCCESS,
        })
    }

    handleDisconnect(socket: Socket<IInitialSocketEventEmits>): void {
        const { referer, cookie } = socket.handshake.headers
        if (cookie) {
            const jwt = this.jwtService.extractJWTFromCookie(cookie)
            if (jwt && referer) {
                const noteUniqueName = Helpers.extractNoteUniqueNameFromURL(referer)
                BaseSessions.removeUserSession(noteUniqueName, jwt)
            }
        }
    }

    @SubscribeMessage(ENoteEvents.NOTE_TYPING)
    async handleNoteFormChanged(
        @MessageBody() data: BroadcastNoteTypingDTO,
        @ConnectedSocket() clientSocket: Socket,
    ): Promise<TBroadcastNoteTypingRes> {
        const { referer, cookie } = clientSocket.handshake.headers
        if (!referer || !cookie) {
            throw new WsException(ENoteBroadcastMessages.INVALID_INPUT)
        }
        const noteUniqueName = Helpers.extractNoteUniqueNameFromURL(referer)
        const noteHasPassword = BaseSessions.checkNote(noteUniqueName)
        if (noteHasPassword) {
            const jwt = this.jwtService.extractJWTFromCookie(cookie)
            if (!jwt) {
                throw new WsException(ENoteBroadcastMessages.INVALID_CREDENTIALS)
            }
            const userExists = BaseSessions.checkUserSessionIfExists(noteUniqueName, jwt)
            if (!userExists) {
                throw new WsException(ENoteBroadcastMessages.USER_LOGOUTED)
            }
        }
        try {
            await this.noteService.updateNoteForm(noteUniqueName, data)
        } catch (error) {
            throw new WsException(error.message)
        }
        clientSocket.broadcast.to(noteUniqueName).emit(ENoteEvents.NOTE_TYPING, data)
        return { data, success: true }
    }
}
