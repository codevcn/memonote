import { APIRoutes } from '@/utils/routes'
import { Controller, Post, Param, Body, Delete, Res, UseGuards } from '@nestjs/common'
import { AddPasswordForNotePayloadDTO, AddPasswordForNoteParamsDTO } from './DTOs'
import { NoteService } from './note.service'
import type { INoteAPIController } from './interfaces'
import type { Response } from 'express'
import { APIAuthGuard } from '@/auth/auth.guard'
import type { TSuccess } from '@/utils/types'

@Controller(APIRoutes.note)
export class NoteAPIController implements INoteAPIController {
    constructor(private noteService: NoteService) {}

    @Post('set-password/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async setPasswordForNote(
        @Param() params: AddPasswordForNoteParamsDTO,
        @Body() payload: AddPasswordForNotePayloadDTO,
        @Res({ passthrough: true }) res: Response<TSuccess>,
    ) {
        const { noteUniqueName } = params
        await this.noteService.setPasswordForNoteHandler(payload, noteUniqueName, res)
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
