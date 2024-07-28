import { Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleGateway } from './gateway/article.gateway'
import { AuthModule } from '@/auth/auth.module'

@Module({
    imports: [AuthModule],
    providers: [ArticleService, ArticleGateway],
})
export class ArticleModule {}
