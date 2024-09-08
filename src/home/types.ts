import type { EEditors } from '../note/constants.js'
import type { TCommonPageData } from '../utils/types.js'

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
