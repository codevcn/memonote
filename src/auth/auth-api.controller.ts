import { Body, Controller, Param, Post, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import type { Response, Request } from 'express'
import { APIRoutes } from '@/utils/routes'
import type { IAuthAPIController } from './interfaces'
import { APIAuthGuard } from '@/auth/auth.guard'
import { NoteUniqueNameOnParamDTO, SignInPayloadDTO } from './auth.dto'

@Controller(APIRoutes.auth)
export class AuthAPIController implements IAuthAPIController {
    constructor(private authService: AuthService) {}

    @Post('sign-in/:noteUniqueName')
    async signIn(
        @Param() params: NoteUniqueNameOnParamDTO,
        @Body() signInPayload: SignInPayloadDTO,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { noteUniqueName } = params
        await this.authService.signIn(noteUniqueName, signInPayload, res)
        return { success: true }
    }

    @Post('logout/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Param() params: NoteUniqueNameOnParamDTO,
    ) {
        const { noteUniqueName } = params
        await this.authService.logout(req, res, noteUniqueName)
        return { success: true }
    }
}
