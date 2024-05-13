import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { EAuthMessages } from '@/utils/messages'
import { JWTService } from './jwt.service'
import { NoteService } from '@/note/note.service'
import type { TNoteDocument } from '@/note/note.schema'
import type { TSignInParams } from './types'

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JWTService,
        private noteService: NoteService,
    ) {}

    async checkAuth(req: Request) {
        const token = this.jwtService.extractJWTToken(req)
        if (!token) {
            throw new UnauthorizedException(EAuthMessages.TOKEN_NOT_FOUND)
        }
        try {
            const { noteUniqueName } = await this.jwtService.verifyToken(token)
            const note = await this.noteService.findNote(noteUniqueName)
            if (!note) throw new Error()
        } catch (error) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_ACCESS)
        }
    }

    async verifyPassword(note: TNoteDocument, password: string): Promise<string> {
        if (note.password !== password) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        return await this.jwtService.createJWT({ noteUniqueName: note.noteUniqueName })
    }

    async signIn(res: Response, { note, password }: TSignInParams): Promise<void> {
        const token = await this.verifyPassword(note, password)
        this.jwtService.sendJWTToClient(res, { token })
    }
}
