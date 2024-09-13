import { ECommonStatuses, EInitialSocketEvents, ESocketNamespaces } from '../utils/constants.js'
import {
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import type { IInitialSocketEventEmits, IMessageSubcribers } from './interfaces.js'
import type { TAuthSocketConnection } from '../auth/types.js'
import { AuthService } from '../auth/auth.service.js'
import { EArticleEvents } from './constants.js'
import { PublishArticlePayloadDTO, UploadImageDTO } from './DTOs.js'
import { ArticleService } from './article.service.js'
import { UseFilters, UsePipes } from '@nestjs/common'
import { WsExceptionsFilter } from '../utils/exception/gateway.filter.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { initGatewayMetadata } from '../configs/config-gateways.js'
import type { TUploadedImage } from './types.js'
import { FileServerService } from './file-server.service.js'
import { wsValidationPipe } from '../configs/config-validation.js'
import { WsNoteCredentials } from '../note/note.decorator.js'
import { NoteCredentialsDTO } from '../note/DTOs.js'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.ARTICLE }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class ArticleGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private server: Server

    constructor(
        private authService: AuthService,
        private articleService: ArticleService,
        private fileServerService: FileServerService,
    ) {}

    afterInit(server: Server) {
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

    @SubscribeMessage(EArticleEvents.PUBLISH_ARTICLE)
    async publishArticle(
        @MessageBody() data: PublishArticlePayloadDTO,
        @WsNoteCredentials() noteCredentials: NoteCredentialsDTO,
    ) {
        const { noteId, noteUniqueName } = noteCredentials
        const { articleChunk, imgs } = data
        try {
            if (imgs) {
                await this.fileServerService.cleanupImages(imgs, noteId)
            } else if (articleChunk) {
                const { chunk, totalChunks, uploadId } = articleChunk
                await this.articleService.uploadArticleChunk(
                    chunk,
                    totalChunks,
                    noteUniqueName,
                    noteId,
                    uploadId,
                )
            }
        } catch (error) {
            if (error instanceof BaseCustomException) {
                return { success: false, message: error.message }
            }
            throw error
        }
        return { success: true }
    }

    @SubscribeMessage(EArticleEvents.UPLOAD_IMAGE)
    async uploadImage(
        @MessageBody() data: UploadImageDTO,
        @WsNoteCredentials() noteCredentials: NoteCredentialsDTO,
    ) {
        const { image } = data
        const { noteId } = noteCredentials
        let uploadedImg: TUploadedImage
        try {
            uploadedImg = await this.fileServerService.uploadImage(image, noteId)
        } catch (error) {
            if (error instanceof BaseCustomException) {
                return { success: false, message: error.message }
            }
            throw error
        }
        return { success: true, uploadedImg }
    }
}
