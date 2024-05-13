import { Get, Controller, Redirect, Param, Res, Post, Body, Req } from '@nestjs/common'
import type { IHomeController } from './interfaces'
import { ServerEndpoint } from '@/utils/decorators/server.decorator'
import { NoteService } from '@/note/note.service'
import { EClientPages } from '@/utils/client/pages'
import { AuthService } from '@/auth/auth.service'
import type { Response, Request } from 'express'
import { SignInPayloadDTO } from './home.dto'
import { BaseCustomException } from '@/utils/exception/custom.exception'

@Controller()
export class HomeController implements IHomeController {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
    ) {}

    @Get()
    @Redirect()
    async homePage(@ServerEndpoint() serverEndpoint: string) {
        const newUniqueName = this.noteService.generateNoteUniqueName()
        return { url: `${serverEndpoint}/${newUniqueName}` }
    }

    @Get(':noteUniqueName')
    async getNoteOnHomePage(
        @Param('noteUniqueName') noteUniqueName: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const note = await this.noteService.findNote(noteUniqueName)
        if (note) {
            if (note.password) {
                try {
                    await this.authService.checkAuth(req)
                    return res.render(EClientPages.homePage, {
                        note: {
                            noteContent: note.content,
                        },
                    })
                } catch (error) {
                    return res.render(EClientPages.signIn)
                }
            } else {
                return res.render(EClientPages.homePage, { noteContent: note.content })
            }
        }
        await this.noteService.createNewNote(noteUniqueName)
        return res.render(EClientPages.homePage)
    }

    @Post('sign-in/:noteUniqueName')
    async signIn(
        @Param('noteUniqueName') noteUniqueName: string,
        @Body() signInPayload: SignInPayloadDTO,
        @Res() res: Response,
    ) {
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException("Didn't find data of note")
        try {
            await this.authService.signIn(res, { note: note, password: signInPayload.password })
            return res.render(EClientPages.homePage, { noteContent: note.content })
        } catch (error) {
            return res.render(EClientPages.signIn, { error })
        }
    }
}
