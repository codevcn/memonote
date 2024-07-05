import { TApplicationInfo } from '@/utils/application/types'

export type TRedirectHomePage = {
    url: string
}

export type TPageData = {
    note: {
        noteContent: undefined | string
        passwordSet: undefined | boolean
    }
}

export type THomePageServerData = {
    appInfo: TApplicationInfo
    note: {
        content: string | null
        title: string | null
        author: string | null
        passwordSet: boolean | null
        noteId: string
    }
}
