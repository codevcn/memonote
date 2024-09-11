import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { TNoteCredentials } from '../utils/server/types.js'
import { NoteService } from './note.service.js'
import { Request } from 'express'

export const WsNoteCredentials = createParamDecorator<unknown, ExecutionContext, TNoteCredentials>(
    (data: unknown, ctx: ExecutionContext) => {
        const socket = ctx.switchToWs().getClient<Socket>()
        return NoteService.getNoteCredentials(socket) || {}
    },
)
