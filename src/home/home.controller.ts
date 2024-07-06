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
import type { TCommonPageData, THomePagePageData } from './types'
import { createServerData } from '@/utils/helpers'

@Controller(ViewRoutes.home)
export class HomeController implements IHomeController {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
        private applicationService: ApplicationService,
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
            } else {
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
                        },
                    }),
                )
            }
        }
        try {
            const createdNote = await this.noteService.createNewNote(noteUniqueName)
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
