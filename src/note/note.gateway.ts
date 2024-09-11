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
import { ENoteEvents } from './constants.js'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces.js'
import { BroadcastNoteTypingDTO } from './DTOs.js'
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common'
import { ECommonStatuses } from '../utils/constants.js'
import { AuthService } from '../auth/auth.service.js'
import { WsExceptionsFilter } from '../utils/exception/gateway.filter.js'
import { initGatewayMetadata } from '../configs/config-gateways.js'
import { wsValidationPipe } from '../configs/config-validation.js'
import { TranscribeAudioService } from '../tools/transcribe-audio.service.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { NoteCredentialsDTO } from './DTOs.js'
import { TAuthSocketConnection } from '../auth/types.js'
import { LoggingInterceptor } from '../temp/logging.interceptor.js'
import { WsNoteCredentials } from './note.decorator.js'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NOTE }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class NoteGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

    constructor(
        private noteService: NoteService,
        private authService: AuthService,
        private transcriptAudioService: TranscribeAudioService,
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
        this.io = server
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

    // @SubscribeMessage(ENoteEvents.TRANSCRIBE_AUDIO)
    // @UseInterceptors(LoggingInterceptor)
    // async transcribeAudio(
    //     @MessageBody() data: TranscribeAudioDTO,
    //     @WsNoteCredentials() noteCredentials: NoteCredentialsDTO,
    // ) {
    //     const { noteUniqueName } = noteCredentials
    //     const { chunk, totalChunks, uploadId } = data
    //     let transcription: string | null
    //     try {
    //         transcription = await this.transcriptAudioService.transcribeAudioHandler(
    //             chunk,
    //             totalChunks,
    //             noteUniqueName,
    //             uploadId,
    //         )
    //     } catch (error) {
    //         if (error instanceof BaseCustomException) {
    //             return { success: false, message: error.message }
    //         }
    //         throw error
    //     }
    //     return { success: true, transcription }
    // }
}
