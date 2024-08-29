import type { Request, Response } from 'express'
import type { GetNoteOnHomePageDTO } from './DTOs'
import type { TCommonPageData, TRedirectController } from '@/utils/types'
import type { ELangCodes } from '@/lang/enums'

export interface IHomeController {
    homePage(
        params: GetNoteOnHomePageDTO,
        req: Request,
        res: Response,
        lang: ELangCodes,
    ): Promise<void>
    randomHomePage(): Promise<TRedirectController>
    aboutPage(): Promise<TCommonPageData>
}
