import type { Request, Response } from 'express'
import type { GetNoteOnHomePageParamsDTO } from './DTOs'
import type { TRedirectController } from '@/utils/types'
import type { TCommonPageData } from './types'

export interface IHomeController {
    homePage(params: GetNoteOnHomePageParamsDTO, req: Request, res: Response): Promise<void>
    randomHomePage(): Promise<TRedirectController>
    aboutPage(): Promise<TCommonPageData>
}
