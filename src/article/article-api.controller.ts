import { Controller, Get, Param } from '@nestjs/common'
import { ArticleService } from './article.service.js'
import { APIRoutes } from '../utils/routes.js'
import { NoteIdDTO } from '../note/DTOs.js'
import { IArticleAPIController } from './interfaces.js'

@Controller(APIRoutes.article)
export class ArticleController implements IArticleAPIController {
    constructor(private articleService: ArticleService) {}

    @Get('fetch-article/:noteId')
    async fetchArticle(@Param() params: NoteIdDTO) {
        const { noteId } = params
        const readableStream = await this.articleService.fetchArticle(noteId)
        return readableStream
    }
}
