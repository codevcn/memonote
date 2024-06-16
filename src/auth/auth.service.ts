import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { EAuthMessages } from '@/utils/messages'
import { JWTService } from './jwt.service'
import { NoteService } from '@/note/note.service'
import type { TJWTPayload, TSignInParams } from './types'
import * as bcrypt from 'bcrypt'

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
        const { noteUniqueName } = req.params //https://localhost:8080/mynote223 -> params === mynote223
        if (noteUniqueName && noteUniqueName === jwtPayload.noteUniqueName) {
            const note = await this.noteService.findNote(jwtPayload.noteUniqueName)
            if (!note) throw new UnauthorizedException(EAuthMessages.NOTE_NOT_FOUND)
        } else {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_AUTH)
        }
    }

    async verifyPassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
        return await bcrypt.compare(rawPassword, hashedPassword)
    }

    async signIn(res: Response, { note, password }: TSignInParams): Promise<void> {
        if (!note.password) {
            throw new BadRequestException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const isMatch = await this.verifyPassword(note.password, password)
        if (!isMatch) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const token = await this.jwtService.createJWT({ noteUniqueName: note.noteUniqueName })
        this.jwtService.sendJWTToClient(res, { token })
    }

    async logout(res: Response): Promise<void> {
        this.jwtService.removeJWTAtClient(res)
    }
}
