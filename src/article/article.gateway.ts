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
import type { TAuthSocketConnection } from '@/auth/types'
import { AuthService } from '@/auth/auth.service'
import { EArticleEvents } from './enums'
import { PublishArticlePayloadDTO, UploadImageDTO } from './DTOs'
import { ArticleService } from './article.service'
import { UseFilters, UsePipes } from '@nestjs/common'
import { WsExceptionsFilter } from '@/utils/exception/gateway.filter'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { initGatewayMetadata } from '@/configs/config-gateways'
import type { TUploadedImage } from './types'
import { FileServerService } from './file-server.service'
import { wsValidationPipe } from '@/configs/config-validation'
import { WsNoteCredentials } from '@/utils/decorators/note.decorator'
import { NoteCredentialsDTO } from '@/note/DTOs'

@WebSocketGateway(initGatewayMetadata({ namespace: ESocketNamespaces.ARTICLE }))
@UsePipes(wsValidationPipe)
@UseFilters(new WsExceptionsFilter())
export class ArticleGateway
    implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit<Server>, IMessageSubcribers
{
    private io: Server

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
        this.io = server
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
