import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { AuthService } from '@/auth/auth.service'
import { NoteService } from './note.service'

@Injectable()
export class SetPasswordGuard implements CanActivate {
    constructor(
        private noteService: NoteService,
        private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>()
        const note = await this.noteService.findNote(request.params.noteUniqueName)
        if (note && note.password) {
            await this.authService.checkAuth(request)
        }
        return true
    }
}
