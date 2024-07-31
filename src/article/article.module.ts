import { Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleGateway } from './gateway/article.gateway'
import { AuthModule } from '@/auth/auth.module'
import { ArticleController } from './article-api.controller'

@Module({
    imports: [AuthModule],
    providers: [ArticleService, ArticleGateway],
    controllers: [ArticleController],
})
export class ArticleModule {}
