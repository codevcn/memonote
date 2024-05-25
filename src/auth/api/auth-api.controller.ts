import { Controller, Post, Res, UseGuards } from '@nestjs/common'
import { AuthService } from '../auth.service'
import { Response } from 'express'
import { APIRoutes } from '@/utils/routes'
import type { IAuthAPIController } from '../interfaces'
import { APIAuthGuard } from '@/auth/auth.guard'

@Controller(APIRoutes.auth)
export class AuthAPIController implements IAuthAPIController {
    constructor(private authService: AuthService) {}

    @Post('logout/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async logout(@Res({ passthrough: true }) res: Response) {
        await this.authService.logout(res)
        return { success: true }
    }
}
