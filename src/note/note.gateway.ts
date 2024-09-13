import {
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayConnection,
    OnGatewayInit,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { NoteService } from './note.service.js'
import { EInitialSocketEvents, ESocketNamespaces } from '../utils/constants.js'
import { EEventEmitterEvents, ENoteEvents } from './constants.js'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces.js'
import { BroadcastNoteTypingDTO } from './DTOs.js'
import { UseFilters, UsePipes } from '@nestjs/common'
import { ECommonStatuses } from '../utils/constants.js'
import { AuthService } from '../auth/auth.service.js'
import { WsExceptionsFilter } from '../utils/exception/gateway.filter.js'
import { initGatewayMetadata } from '../configs/config-gateways.js'
import { wsValidationPipe } from '../configs/config-validation.js'
import { NoteCredentialsDTO } from './DTOs.js'
import { TAuthSocketConnection } from '../auth/types.js'
import { WsNoteCredentials } from './note.decorator.js'
import { OnEvent } from '@nestjs/event-emitter'
import { BaseCustomEmittedEvent } from '../utils/custom.events.js'
import { TTranscribeAudioState } from '../tools/types.js'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NOTE }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class NoteGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private server: Server

    constructor(
        private noteService: NoteService,
        private authService: AuthService,
    ) {}

    afterInit(server: Server): void {
        server.use(async (socket, next) => {
            let authResult: TAuthSocketConnection
            try {
                authResult = await this.authService.authSocketConnection(socket)
            } catch (error) {
                return next(error)
            }
            socket.join(authResult.noteUniqueName)
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

    @SubscribeMessage(ENoteEvents.NOTE_FORM_EDITED)
    async noteFormEdited(
        @MessageBody() data: BroadcastNoteTypingDTO,
        @ConnectedSocket() clientSocket: Socket,
        @WsNoteCredentials() noteInfo: NoteCredentialsDTO,
    ) {
        const { noteUniqueName } = noteInfo
        try {
            await this.authService.validateIncommingMessage(clientSocket, noteUniqueName)
        } catch (error) {
            return { data, success: false }
        }
        await this.noteService.updateNoteForm(noteUniqueName, data)
        clientSocket.broadcast.to(noteUniqueName).emit(ENoteEvents.NOTE_FORM_EDITED, data)
        return { data, success: true }
    }

    @SubscribeMessage(ENoteEvents.FETCH_NOTE_FORM)
    async fetchNoteForm(
        @ConnectedSocket() clientSocket: Socket,
        @WsNoteCredentials() noteInfo: NoteCredentialsDTO,
    ) {
        const { noteUniqueName } = noteInfo
        try {
            await this.authService.validateIncommingMessage(clientSocket, noteUniqueName)
        } catch (error) {
            return { data: {}, success: false }
        }
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) {
            return { data: {}, success: false }
        }
        return {
            data: {
                title: note.title,
                author: note.author,
                content: note.content,
            },
            success: true,
        }
    }

    @OnEvent(EEventEmitterEvents.TRANSCRIBE_AUIDO_STATE)
    transcribeAudioState(event: BaseCustomEmittedEvent<TTranscribeAudioState>) {
        const { clientSocketId, state } = event.payload
        this.server.to(clientSocketId).emit(ENoteEvents.TRANSCRIBE_AUDIO_STATE, { state })
    }
}
