import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { EAuthMessages } from '@/utils/messages'
import { JWTService } from './jwt.service'
import { NoteService } from '@/note/note.service'
import type { TJWTPayload } from './types'
import * as bcrypt from 'bcrypt'
import { UserSessions } from '@/note/gateway/sessions'
import { SignInPayloadDTO } from './auth.dto'
import { BaseCustomException } from '@/utils/exception/custom.exception'

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JWTService,
        private noteService: NoteService,
    ) {}

    async checkAuth(req: Request): Promise<void> {
        const token = this.jwtService.extractJWTFromRequest(req)
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
        const userSessionExists = UserSessions.checkUserSessionIfExists(noteUniqueName, token)
        if (noteUniqueName && noteUniqueName === jwtPayload.noteUniqueName && userSessionExists) {
            const note = await this.noteService.findNote(jwtPayload.noteUniqueName)
            if (!note) throw new UnauthorizedException(EAuthMessages.NOTE_NOT_FOUND)
        } else {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_AUTH)
        }
    }

    async verifyPassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
        return await bcrypt.compare(rawPassword, hashedPassword)
    }

    async signIn(
        noteUniqueName: string,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<void> {
        const { password } = signInPayload
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException(EAuthMessages.NOTE_NOT_FOUND)
        if (!note.password) {
            throw new BadRequestException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const isMatch = await this.verifyPassword(note.password, password)
        if (!isMatch) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const token = await this.jwtService.createJWT({ noteUniqueName: note.noteUniqueName })
        UserSessions.addUserSession(noteUniqueName, token)
        this.jwtService.sendJWTToClient(res, { token })
    }

    async logout(req: Request, res: Response, noteUniqueName: string): Promise<void> {
        const jwt = this.jwtService.extractJWTFromRequest(req)!
        UserSessions.removeUserSession(noteUniqueName, jwt)
        this.jwtService.removeJWTAtClient(res)
    }
}
