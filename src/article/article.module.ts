import { Module } from '@nestjs/common'
import { ArticleService } from './article.service.js'
import { ArticleGateway } from './article.gateway.js'
import { AuthModule } from '../auth/auth.module.js'
import { ArticleController } from './article-api.controller.js'
import { FileServerService } from './file-server.service.js'

@Module({
    imports: [AuthModule],
    providers: [ArticleService, ArticleGateway, FileServerService],
    controllers: [ArticleController],
})
export class ArticleModule {}
