import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import type { Response } from 'express'
import { APIRoutes } from '@/utils/routes'
import type { IAuthAPIController } from './interfaces'
import { APIAuthGuard } from '@/auth/auth.guard'
import { NoteService } from '@/note/note.service'
import { GetNoteOnHomePageParamsDTO, SignInPayloadDTO } from './auth.dto'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EAuthMessages } from '@/utils/messages'

@Controller(APIRoutes.auth)
export class AuthAPIController implements IAuthAPIController {
    constructor(
        private authService: AuthService,
        private noteService: NoteService,
    ) {}

    @Post('sign-in/:noteUniqueName')
    async signIn(
        @Param() params: GetNoteOnHomePageParamsDTO,
        @Body() signInPayload: SignInPayloadDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { noteUniqueName } = params
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException(EAuthMessages.NOTE_NOT_FOUND)
        await this.authService.signIn(res, { note, password: signInPayload.password })
        return { success: true }
    }

    @Post('logout/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async logout(@Res({ passthrough: true }) res: Response) {
        await this.authService.logout(res)
        return { success: true }
    }
}
