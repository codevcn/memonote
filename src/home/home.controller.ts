import { Get, Controller, Redirect, Param, Res, Req, HttpStatus, Render } from '@nestjs/common'
import type { IHomeController } from './interfaces.js'
import { NoteService } from '../note/note.service.js'
import { ClientViewPages } from '../utils/application/view-pages.js'
import { AuthService } from '../auth/auth.service.js'
import type { Response, Request } from 'express'
import { GetNoteOnHomePageDTO } from './DTOs.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { ApplicationService } from '../utils/application/application.service.js'
import { ViewRoutes } from '../utils/routes.js'
import type { THomePagePageData } from './types.js'
import { createClientPageData } from '../utils/helpers.js'
import type { TCommonPageData } from '../utils/types.js'
import { LangService } from '../lang/lang.service.js'

@Controller(ViewRoutes.home)
export class HomeController implements IHomeController {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
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
        @Param() params: GetNoteOnHomePageDTO,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { noteUniqueName } = params
        const note = await this.noteService.findNote(noteUniqueName)
        const appInfo = await ApplicationService.getApplicationInfo()
        const currentLang = this.langService.getCurrentLang()
        const langs = this.langService.getSupportedLangs()
        if (note) {
            if (note.password) {
                try {
                    await this.authService.checkAuthentication(req)
                    return res.status(HttpStatus.OK).render(
                        ClientViewPages.home,
                        createClientPageData<THomePagePageData>({
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
                        createClientPageData<TCommonPageData>({
                            verified: false,
                            appInfo,
                        }),
                    )
                }
            }
            return res.status(HttpStatus.OK).render(
                ClientViewPages.home,
                createClientPageData<THomePagePageData>({
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
                createClientPageData<THomePagePageData>({
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
        const appInfo = await ApplicationService.getApplicationInfo()
        return { appInfo, verified: true }
    }
}
