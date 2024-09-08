import type { Request, Response } from 'express'
import type { GetNoteOnHomePageDTO } from './DTOs.js'
import type { TCommonPageData, TRedirectController } from '../utils/types.js'
import type { ELangCodes } from '../lang/constants.js'

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
