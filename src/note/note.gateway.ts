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
import { BroadcastNoteTypingDTO } from './DTOs'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { ECommonStatuses } from '@/utils/enums'
import { AuthService } from '@/auth/auth.service'
import type { TAuthSocketConnectionReturn } from '@/auth/types'
import { WsExceptionsFilter } from '@/utils/exception/gateway.filter'
import { initGatewayMetadata } from '@/configs/config-gateways'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.NORMAL_EDITOR }))
@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
export class NoteGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

    constructor(
        private noteService: NoteService,
        private authService: AuthService,
    ) {}

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

    @SubscribeMessage(ENoteEvents.NOTE_FORM_EDITED)
    async noteFormEdited(
        @MessageBody() data: BroadcastNoteTypingDTO,
        @ConnectedSocket() clientSocket: Socket,
    ) {
        let noteUniqueName: string
        try {
            const result = await this.authService.validateIncommingMessage(clientSocket)
            noteUniqueName = result.noteUniqueName
        } catch (error) {
            return { data, success: false }
        }
        await this.noteService.updateNoteForm(noteUniqueName, data)
        clientSocket.broadcast.to(noteUniqueName).emit(ENoteEvents.NOTE_FORM_EDITED, data)
        return { data, success: true }
    }

    @SubscribeMessage(ENoteEvents.FETCH_NOTE_FORM)
    async fetchNoteForm(@ConnectedSocket() clientSocket: Socket) {
        let noteUniqueName: string
        try {
            const result = await this.authService.validateIncommingMessage(clientSocket)
            noteUniqueName = result.noteUniqueName
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
}
