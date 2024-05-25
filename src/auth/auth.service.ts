import { Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { EAuthMessages } from '@/utils/messages'
import { JWTService } from './jwt.service'
import { NoteService } from '@/note/note.service'
import type { TNoteDocument } from '@/database/note.model'
import type { TJWTPayload, TSignInParams } from './types'

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JWTService,
        private noteService: NoteService,
    ) {}

    async checkAuth(req: Request): Promise<void> {
        const token = this.jwtService.extractJWTToken(req)
        if (!token) {
            throw new UnauthorizedException(EAuthMessages.TOKEN_NOT_FOUND)
        }
        let jwtPayload: TJWTPayload
        try {
            jwtPayload = await this.jwtService.verifyToken(token)
        } catch (error) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_AUTH)
        }
        const { noteUniqueName } = req.params
        if (noteUniqueName && noteUniqueName !== jwtPayload.noteUniqueName) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_AUTH)
        }
        const note = await this.noteService.findNote(jwtPayload.noteUniqueName)
        if (!note) throw new UnauthorizedException(EAuthMessages.NOTE_NOT_FOUND)
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

    async logout(res: Response): Promise<void> {
        this.jwtService.removeJWTAtClient(res)
    }
}
