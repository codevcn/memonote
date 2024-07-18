import type { TCommonPageData } from '@/utils/types'

export type TRedirectHomePage = {
    url: string
}

export type TUILanguage = {
    code: string
    label: string
}

export type THomePagePageData = TCommonPageData & {
    note: {
        content: string | null
        title: string | null
        author: string | null
        passwordSet: boolean | null
        noteId: string
    }
    settings: {
        langs: TUILanguage[]
        currentLang: string
    }
}

export type TDataLanguage = {
    en: 'English'
    vi: 'Vietnamese'
}
