import { ECommonStatuses, EInitialSocketEvents, ESocketNamespaces } from '@/utils/enums'
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces'
import type { TAuthSocketConnectionReturn } from '@/auth/types'
import { AuthService } from '@/auth/auth.service'
import { EArticleEvents } from './enums'
import { PublishNotePayloadDTO } from './DTOs'
import { ArticleService } from '../article.service'
import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common'
import { WsExceptionsFilter } from '@/utils/exception/gateway.filter'
import { BaseCustomException } from '@/utils/exception/custom.exception'

@WebSocketGateway({ namespace: ESocketNamespaces.ARTICLE })
@UsePipes(new ValidationPipe())
@UseFilters(new WsExceptionsFilter())
export class ArticleGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

    constructor(
        private authService: AuthService,
        private articleService: ArticleService,
    ) {}

    afterInit(server: Server) {
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

    @SubscribeMessage(EArticleEvents.PUBLISH_ARTICLE)
    async publishArticle(@MessageBody() data: PublishNotePayloadDTO) {
        const { articleChunk, totalChunks, noteUniqueName, noteId, uploadId } = data
        try {
            await this.articleService.uploadArticleChunk(
                articleChunk,
                totalChunks,
                noteUniqueName,
                noteId,
                uploadId,
            )
        } catch (error) {
            if (error instanceof BaseCustomException) {
                return { success: false, message: error.message }
            }
            throw error
        }
        return { success: true }
    }
}
