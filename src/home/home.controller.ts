import {
    Get,
    Controller,
    Redirect,
    Param,
    Res,
    Post,
    Body,
    Req,
    HttpStatus,
    Render,
} from '@nestjs/common'
import type { IHomeController } from './interfaces'
import { ServerEndpoint } from '@/utils/decorators/server.decorator'
import { NoteService } from '@/note/note.service'
import { ClientViewPages } from '@/utils/application/view-pages'
import { AuthService } from '@/auth/auth.service'
import type { Response, Request } from 'express'
import { NoteUniqueNameDTO, SignInPayloadDTO } from './home.dto'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ApplicationService } from '@/utils/application/application.service'

@Controller()
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
        @Param() params: NoteUniqueNameDTO,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const { noteUniqueName } = params
        const note = await this.noteService.findNote(noteUniqueName)
        const appInfo = this.applicationService.getApplicationInfo()
        if (note) {
            if (note.password) {
                try {
                    await this.authService.checkAuth(req)
                    return res.status(HttpStatus.OK).render(ClientViewPages.home, {
                        note: {
                            noteContent: note.content,
                        },
                        appInfo,
                    })
                } catch (error) {
                    return res.status(HttpStatus.OK).render(ClientViewPages.signIn, { appInfo })
                }
            } else {
                return res
                    .status(HttpStatus.OK)
                    .render(ClientViewPages.home, { noteContent: note.content, appInfo })
            }
        }
        await this.noteService.createNewNote(noteUniqueName)
        return res.status(HttpStatus.OK).render(ClientViewPages.home, { appInfo })
    }

    @Post('sign-in/:noteUniqueName')
    async signIn(
        @Param('noteUniqueName') noteUniqueName: string,
        @Body() signInPayload: SignInPayloadDTO,
        @Res() res: Response,
    ) {
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException("Didn't find data of note")
        const appInfo = this.applicationService.getApplicationInfo()
        try {
            await this.authService.signIn(res, { note: note, password: signInPayload.password })
            return res
                .status(HttpStatus.OK)
                .render(ClientViewPages.home, { noteContent: note.content, appInfo })
        } catch (error) {
            return res.status(HttpStatus.OK).render(ClientViewPages.signIn, { error, appInfo })
        }
    }

    @Get('menu/about')
    @Render(ClientViewPages.about)
    async aboutPage() {
        const appInfo = this.applicationService.getApplicationInfo()
        return { appInfo }
    }
}
