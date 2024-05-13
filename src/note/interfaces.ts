import type { TGetHomePageData } from './types'

export interface INoteController {
    getNote(noteUniqueName: string): Promise<TGetHomePageData>
}
