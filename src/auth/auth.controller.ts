import { Body, Controller, HttpStatus, Param, Post, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { NoteService } from '@/note/note.service'
import { SignInPayloadDTO, GetNoteOnHomePageParamsDTO } from './auth.dto'
import type { IAuthController } from './interfaces'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ApplicationService } from '@/utils/application/application.service'
import type { Response } from 'express'
import { ClientViewPages } from '@/utils/application/view-pages'
import { ViewRoutes } from '@/utils/routes'

@Controller(ViewRoutes.auth)
export class AuthController implements IAuthController {
    constructor(
        private authService: AuthService,
        private noteService: NoteService,
        private applicationService: ApplicationService,
    ) {}

    @Post('sign-in/:noteUniqueName')
    async signIn(
        @Param() params: GetNoteOnHomePageParamsDTO,
        @Body() signInPayload: SignInPayloadDTO,
        @Res() res: Response,
    ) {
        const { noteUniqueName } = params
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException("Didn't find data of note")
        const appInfo = await this.applicationService.getApplicationInfo()
        try {
            await this.authService.signIn(res, { note, password: signInPayload.password })
            res.status(HttpStatus.OK).render(ClientViewPages.home, {
                note: {
                    noteContent: note.content,
                    passwordSet: true,
                },
                appInfo,
            })
            return
        } catch (error) {
            res.status(HttpStatus.OK).render(ClientViewPages.signIn, { error, appInfo })
            return
        }
    }
}
