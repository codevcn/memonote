import { Get, Controller, Redirect, Param, Res, Req, HttpStatus, Render } from '@nestjs/common'
import type { IHomeController } from './interfaces'
import { ServerEndpoint } from '@/utils/decorators/server.decorator'
import { NoteService } from '@/note/note.service'
import { ClientViewPages } from '@/utils/application/view-pages'
import { AuthService } from '@/auth/auth.service'
import type { Response, Request } from 'express'
import { GetNoteOnHomePageParamsDTO } from './home.dto'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ApplicationService } from '@/utils/application/application.service'
import { ViewRoutes } from '@/utils/routes'

@Controller(ViewRoutes.home)
export class HomeController implements IHomeController {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
        private applicationService: ApplicationService,
    ) {}

    @Get()
    @Redirect()
    async homePage(@ServerEndpoint() serverEndpoint: string) {
        const newUniqueName = this.noteService.generateNoteUniqueName()
        return { url: `${serverEndpoint}/${newUniqueName}` }
    }

    @Get(':noteUniqueName')
    async getNoteOnHomePage(
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
                    await this.authService.checkAuth(req)
                    res.status(HttpStatus.OK).render(ClientViewPages.home, {
                        appInfo,
                        note: {
                            content: note.content,
                            title: note.title,
                            passwordSet: true,
                        },
                    })
                    return
                } catch (error) {
                    res.status(HttpStatus.OK).render(ClientViewPages.signIn, { appInfo })
                    return
                }
            } else {
                res.status(HttpStatus.OK).render(ClientViewPages.home, {
                    note: {
                        content: note.content,
                        title: note.title,
                        passwordSet: false,
                    },
                    appInfo,
                })
                return
            }
        }
        try {
            await this.noteService.createNewNote(noteUniqueName)
        } catch (error) {
            throw new BaseCustomException("Can't create new note", error.code)
        }
        res.status(HttpStatus.OK).render(ClientViewPages.home, {
            note: {
                content: null,
                title: null,
                passwordSet: false,
            },
            appInfo,
        })
    }

    @Get('menu/about')
    @Render(ClientViewPages.about)
    async aboutPage() {
        const appInfo = await this.applicationService.getApplicationInfo()
        return { appInfo }
    }
}
