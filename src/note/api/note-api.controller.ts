import { APIRoutes } from '@/utils/routes'
import { Controller, Post, Param, Body, Delete, Res, UseGuards } from '@nestjs/common'
import { AddPasswordForNotePayloadDTO, AddPasswordForNoteParamsDTO } from '../note.dto'
import { NoteService } from '../note.service'
import type { INoteAPIController } from '../interfaces'
import type { Response } from 'express'
import { APIAuthGuard } from '@/auth/auth.guard'
import { SetPasswordGuard } from '../note.guard'
import type { TSuccess } from '@/utils/types'

@Controller(APIRoutes.note)
export class NoteAPIController implements INoteAPIController {
    constructor(private noteService: NoteService) {}

    @Post('set-password/:noteUniqueName')
    @UseGuards(SetPasswordGuard)
    async setPasswordForNote(
        @Param() params: AddPasswordForNoteParamsDTO,
        @Body() payload: AddPasswordForNotePayloadDTO,
        @Res({ passthrough: true }) res: Response<TSuccess>,
    ) {
        const { password } = payload
        const { noteUniqueName } = params
        await this.noteService.setPasswordForNote(password, noteUniqueName, res)
        return { success: true }
    }

    @Delete('remove-password/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async removePasswordForNote(@Param() params: AddPasswordForNoteParamsDTO) {
        const { noteUniqueName } = params
        await this.noteService.removePasswordForNote(noteUniqueName)
        return { success: true }
    }
}
