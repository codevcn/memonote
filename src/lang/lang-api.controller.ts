import { Body, Controller, Post, Res } from '@nestjs/common'
import { LangService } from './lang.service.js'
import { APIRoutes } from '../utils/routes.js'
import type { Response } from 'express'
import { RequestLangDTO } from './DTOs.js'
import type { ILangAPIController } from './interfaces.js'

@Controller(APIRoutes.lang)
export class LangController implements ILangAPIController {
    constructor(private langService: LangService) {}

    @Post('request-lang')
    async requestLang(@Res({ passthrough: true }) res: Response, @Body() payload: RequestLangDTO) {
        this.langService.requestLang(res, payload.langCode)
        return { success: true }
    }
}
