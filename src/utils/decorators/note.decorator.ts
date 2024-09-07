import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Socket } from 'socket.io'
import { TNoteCredentials } from './types'
import { NoteService } from '@/note/note.service'

export const WsNoteCredentials = createParamDecorator<unknown, ExecutionContext, TNoteCredentials>(
    (data: unknown, ctx: ExecutionContext) => {
        const socket = ctx.switchToWs().getClient<Socket>()
        return NoteService.getNoteCredentials(socket) || {}
    },
)
