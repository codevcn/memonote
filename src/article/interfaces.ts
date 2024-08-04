import type { NoteIdDTO } from '@/note/DTOs'
import type { StreamableFile } from '@nestjs/common'

export interface IArticleAPIController {
    fetchArticle: (params: NoteIdDTO) => Promise<StreamableFile | null>
}
