import type { Request, Response } from 'express'
import type { GetNoteOnHomePageParamsDTO } from './DTOs'
import type { TApplicationInfo } from '@/utils/application/types'
import type { TRedirectController } from '@/utils/types'

export interface IHomeController {
    homePage(params: GetNoteOnHomePageParamsDTO, req: Request, res: Response): Promise<void>
    randomHomePage(): Promise<TRedirectController>
    aboutPage(): Promise<{ appInfo: TApplicationInfo }>
}
