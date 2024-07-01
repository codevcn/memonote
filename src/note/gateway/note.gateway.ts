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
import { ENoteBroadcastMessages } from '@/utils/messages'
import { JWTService } from '@/auth/jwt.service'
import { BroadcastNoteTypingDTO } from './dtos'
import type { TBroadcastNoteTypingRes } from './types'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { WsExceptionsFilter } from './filters'
import { Helpers } from '@/utils/helpers'
import { UserSessions } from './sessions'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EAuthMessages } from '@/utils/messages'
import type { TJWTPayload } from '@/auth/types'
import { ECommonStatuses } from '@/utils/enums'
import { CustomWsException } from './ecxeptions'

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

    afterInit(server: Server): void {
        server.use(async (socket, next) => {
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

    private returnNoteFormChangedData(
        data: BroadcastNoteTypingDTO,
        success: boolean,
    ): TBroadcastNoteTypingRes {
        return { data, success }
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
        const noteHasPassword = UserSessions.checkNote(noteUniqueName)
        if (noteHasPassword) {
            const jwt = this.jwtService.extractJWTFromCookie(cookie)
            if (!jwt) {
                throw new CustomWsException(
                    ENoteBroadcastMessages.INVALID_CREDENTIALS,
                    noteUniqueName,
                )
            }
            const userExists = UserSessions.checkUserSessionIfExists(noteUniqueName, jwt)
            if (!userExists) {
                return this.returnNoteFormChangedData(data, false)
            }
        }
        try {
            await this.noteService.updateNoteForm(noteUniqueName, data)
        } catch (error) {
            throw new CustomWsException(error.message, noteUniqueName)
        }
        clientSocket.broadcast.to(noteUniqueName).emit(ENoteEvents.NOTE_TYPING, data)
        return this.returnNoteFormChangedData(data, true)
    }
}
