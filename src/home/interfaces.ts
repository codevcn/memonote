import type { Request, Response } from 'express'
import { GetNoteOnHomePageParamsDTO } from './DTOs'
import { TApplicationInfo } from '@/utils/application/types'

export interface IHomeController {
    getNoteOnHomePage(
        params: GetNoteOnHomePageParamsDTO,
        req: Request,
        res: Response,
    ): Promise<void>
    homePage(serverEndpoint: string): Promise<{ url: string }>
    aboutPage(): Promise<{ appInfo: TApplicationInfo }>
}
