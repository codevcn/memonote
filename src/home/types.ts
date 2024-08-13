import type { EEditors } from '@/note/enums'
import type { TCommonPageData } from '@/utils/types'

export type TRedirectHomePage = {
    url: string
}

export type THomePagePageData = TCommonPageData & {
    note: {
        content: string | null
        title: string | null
        author: string | null
        passwordSet: boolean | null
        noteId: string
        editor: EEditors
    }
    settings: {
        langs: string[]
        currentLang: string
    }
}
