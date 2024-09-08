import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { TNoteCredentials } from './types.js'
import { NoteService } from '../../note/note.service.js'

export const WsNoteCredentials = createParamDecorator<unknown, ExecutionContext, TNoteCredentials>(
    (data: unknown, ctx: ExecutionContext) => {
        const socket = ctx.switchToWs().getClient<Socket>()
        return NoteService.getNoteCredentials(socket) || {}
    },
)
