import type { TSuccess } from '@/utils/types'
import type { TUploadedImage } from '../types'

export type TPublishArticleReturn = TSuccess & {
    message?: string
}

export type TUploadImageReturn = TSuccess & {
    message?: string
    imgInfo?: TUploadedImage
}
