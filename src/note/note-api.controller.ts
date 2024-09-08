import { APIRoutes } from '../utils/routes.js'
import { Controller, Post, Param, Body, Delete, Res, UseGuards } from '@nestjs/common'
import { SetPasswordForNotePayloadDTO, NoteUniqueNameDTO, SwitchEditorPayloadDTO } from './DTOs.js'
import { NoteService } from './note.service.js'
import type { INoteAPIController } from './interfaces.js'
import type { Response } from 'express'
import { APIAuthGuard } from '../auth/auth.guard.js'
import type { TSuccess } from '../utils/types.js'
import { Lang } from '../lang/lang.decorator.js'
import { ELangCodes } from '../lang/constants.js'

@Controller(APIRoutes.note)
export class NoteAPIController implements INoteAPIController {
    constructor(private noteService: NoteService) {}

    @Post('set-password/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async setPasswordForNote(
        @Param() params: NoteUniqueNameDTO,
        @Body() payload: SetPasswordForNotePayloadDTO,
        @Res({ passthrough: true }) res: Response<TSuccess>,
        @Lang() lang: ELangCodes,
    ) {
        const { noteUniqueName } = params
        await this.noteService.setPasswordForNoteHandler(payload, noteUniqueName, res, lang)
        return { success: true }
    }

    @Delete('remove-password/:noteUniqueName')
    @UseGuards(APIAuthGuard)
    async removePasswordForNote(@Param() params: NoteUniqueNameDTO, @Lang() lang: ELangCodes) {
        const { noteUniqueName } = params
        await this.noteService.removePasswordForNote(noteUniqueName, lang)
        return { success: true }
    }

    @Post('switch-editor/:noteUniqueName')
    async switchEditor(
        @Param() params: NoteUniqueNameDTO,
        @Body() payload: SwitchEditorPayloadDTO,
    ) {
        const { noteUniqueName } = params
        const { editor } = payload
        await this.noteService.switchEditor(noteUniqueName, editor)
        return { success: true }
    }
}
