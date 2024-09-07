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
import { NoteService } from './note.service'
import { EInitialSocketEvents, ESocketNamespaces } from '@/utils/enums'
import { ENoteEvents } from './enums'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces'
import { BroadcastNoteTypingDTO, TranscriptAudioDTO } from './DTOs'
import { UseFilters, UseInterceptors, UsePipes } from '@nestjs/common'
import { ECommonStatuses } from '@/utils/enums'
import { AuthService } from '@/auth/auth.service'
import { WsExceptionsFilter } from '@/utils/exception/gateway.filter'
import { initGatewayMetadata } from '@/configs/config-gateways'
import { wsValidationPipe } from '@/configs/config-validation'
import { TranscriptAudioService } from '@/tools/transcript-audio.service'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { NoteCredentialsDTO } from './DTOs'
import { TAuthSocketConnection } from '@/auth/types'
import { LoggingInterceptor } from '@/temp/logging.interceptor'
import { WsNoteCredentials } from '@/utils/decorators/note.decorator'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NORMAL_EDITOR }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class NormalEditorGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

    constructor(
        private noteService: NoteService,
        private authService: AuthService,
        private transcriptAudioService: TranscriptAudioService,
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

    @SubscribeMessage('uuu')
    @UseInterceptors(LoggingInterceptor)
    async transcriptAudio(
        @MessageBody() data: TranscriptAudioDTO,
        @WsNoteCredentials() noteCredentials: NoteCredentialsDTO,
    ) {
        const { noteUniqueName } = noteCredentials
        const { chunk, totalChunks, uploadId } = data
        console.log('>>> payload >>>', { data })
        // try {
        //     await this.transcriptAudioService.transcriptAudioHandler(noteUniqueName)
        // } catch (error) {
        //     if (error instanceof BaseCustomException) {
        //         return { success: false }
        //     }
        //     throw error
        // }
        return { success: true }
    }
}
