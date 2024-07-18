import { Body, Controller, Post, Res } from '@nestjs/common'
import { LangService } from './lang.service'
import { APIRoutes } from '@/utils/routes'
import type { Response } from 'express'
import { RequestLangDTO } from './DTOs'

@Controller(APIRoutes.lang)
export class LangController {
    constructor(private langService: LangService) {}

    @Post('request-lang')
    async requestLang(@Res({ passthrough: true }) res: Response, @Body() payload: RequestLangDTO) {
        this.langService.requestLang(res, payload.langCode)
    }
}
