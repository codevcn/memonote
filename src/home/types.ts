import type { TApplicationInfo } from '@/utils/application/types'

export type TRedirectHomePage = {
    url: string
}

export type TCommonPageData = {
    appInfo: TApplicationInfo
    verified: boolean
}

export type THomePagePageData = TCommonPageData & {
    note: {
        content: string | null
        title: string | null
        author: string | null
        passwordSet: boolean | null
        noteId: string
    }
}
