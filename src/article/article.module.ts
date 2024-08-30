import { Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleGateway } from './article.gateway'
import { AuthModule } from '@/auth/auth.module'
import { ArticleController } from './article-api.controller'
import { FileServerService } from './file-server.service'

@Module({
    imports: [AuthModule],
    providers: [ArticleService, ArticleGateway, FileServerService],
    controllers: [ArticleController],
})
export class ArticleModule {}
