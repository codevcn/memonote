import { Get, Controller, Redirect, Param, Res, Req, HttpStatus, Render } from '@nestjs/common'
import type { IHomeController } from './interfaces'
import { NoteService } from '@/note/note.service'
import { ClientViewPages } from '@/utils/application/view-pages'
import { AuthService } from '@/auth/auth.service'
import type { Response, Request } from 'express'
import { GetNoteOnHomePageParamsDTO } from './DTOs'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ApplicationService } from '@/utils/application/application.service'
import { ViewRoutes } from '@/utils/routes'
import type { TLanguagesDataTrans, THomePagePageData } from './types'
import { createServerData } from '@/utils/helpers'
import { I18nService } from 'nestjs-i18n'
import type { IUII18nTranslations } from '@/lang/i18n.generated'
import type { TCommonPageData } from '@/utils/types'
import { LangService } from '@/lang/lang.service'

@Controller(ViewRoutes.home)
export class HomeController implements IHomeController {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
        private applicationService: ApplicationService,
        private i18n: I18nService<IUII18nTranslations>,
        private langService: LangService,
    ) {}

    @Get()
    @Redirect()
    async randomHomePage() {
        const newUniqueName = this.noteService.generateNoteUniqueName()
        return { url: `/${newUniqueName}` }
    }

    @Get(':noteUniqueName')
    async homePage(
        @Param() params: GetNoteOnHomePageParamsDTO,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { noteUniqueName } = params
        const note = await this.noteService.findNote(noteUniqueName)
        const appInfo = await this.applicationService.getApplicationInfo()
        const currentLang = this.langService.getCurrentLang()
        const langsTrans = this.i18n.t('home-page.settings.language.langs', {
            lang: currentLang,
        }) as TLanguagesDataTrans
        const langs = Object.entries(langsTrans).map(([code, label]) => ({ code, label }))
        if (note) {
            if (note.password) {
                try {
                    await this.authService.checkAuthentication(req)
                    return res.status(HttpStatus.OK).render(
                        ClientViewPages.home,
                        createServerData<THomePagePageData>({
                            verified: true,
                            appInfo,
                            note: {
                                content: note.content,
                                title: note.title,
                                author: note.author,
                                passwordSet: true,
                                noteId: note._id.toString(),
                                editor: note.editor,
                            },
                            settings: {
                                langs,
                                currentLang,
                            },
                        }),
                    )
                } catch (error) {
                    return res.status(HttpStatus.OK).render(
                        ClientViewPages.signIn,
                        createServerData<TCommonPageData>({
                            verified: false,
                            appInfo,
                        }),
                    )
                }
            }
            return res.status(HttpStatus.OK).render(
                ClientViewPages.home,
                createServerData<THomePagePageData>({
                    verified: true,
                    appInfo,
                    note: {
                        content: note.content,
                        title: note.title,
                        author: note.author,
                        passwordSet: false,
                        noteId: note._id.toString(),
                        editor: note.editor,
                    },
                    settings: {
                        langs,
                        currentLang,
                    },
                }),
            )
        }
        try {
            const createdNote = await this.noteService.createNewNoteHandler(noteUniqueName)
            return res.status(HttpStatus.OK).render(
                ClientViewPages.home,
                createServerData<THomePagePageData>({
                    verified: true,
                    appInfo,
                    note: {
                        content: null,
                        title: null,
                        author: null,
                        passwordSet: false,
                        noteId: createdNote._id.toString(),
                        editor: createdNote.editor,
                    },
                    settings: {
                        langs,
                        currentLang,
                    },
                }),
            )
        } catch (error) {
            throw new BaseCustomException("Can't create new note", error.code)
        }
    }

    @Get('menu/about')
    @Render(ClientViewPages.about)
    async aboutPage() {
        const appInfo = await this.applicationService.getApplicationInfo()
        return { appInfo, verified: true }
    }
}
