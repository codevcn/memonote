import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request, Response } from 'express'
import { EAuthMessages } from './messages'
import { JWTService } from './jwt.service'
import { NoteService } from '@/note/note.service'
import type { TAuthSocketConnection, TJWTPayload } from './types'
import { UserSessions } from '@/note/sessions'
import { SignInPayloadDTO } from './DTOs'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ENoteMessages } from '@/note/messages'
import { Socket } from 'socket.io'
import { EValidationMessages } from '@/utils/validation/messages'
import type { TValidateIncommingSocketReturn } from '@/note/types'
import { CustomWsException } from '@/utils/exception/ecxeptions'
import { validateJson } from '@/utils/helpers'
import { NoteCredentialsDTO } from '@/note/DTOs'

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JWTService,
        private noteService: NoteService,
    ) {}

    async checkAuthentication(req: Request): Promise<void> {
        const { noteUniqueName } = req.params //https://localhost:8080/mynote223 -> params === mynote223
        const note = await this.noteService.findNote(noteUniqueName)
        if (note && note.password) {
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
            const userSessionExists = UserSessions.checkUserSessionIfExists(noteUniqueName, token)
            if (
                noteUniqueName &&
                noteUniqueName === jwtPayload.noteUniqueName &&
                userSessionExists
            ) {
                if (!note) {
                    throw new UnauthorizedException(ENoteMessages.NOTE_NOT_FOUND)
                }
            } else {
                throw new UnauthorizedException(EAuthMessages.FAIL_TO_AUTH)
            }
        }
    }

    async signIn(
        noteUniqueName: string,
        signInPayload: SignInPayloadDTO,
        res: Response,
    ): Promise<void> {
        const { password } = signInPayload
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) {
            throw new BaseCustomException(ENoteMessages.NOTE_NOT_FOUND)
        }
        if (!note.password) {
            throw new BadRequestException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const isMatch = await this.noteService.verifyPassword(note.password, password)
        if (!isMatch) {
            throw new UnauthorizedException(EAuthMessages.FAIL_TO_VERIFY_PASSWORD)
        }
        const token = await this.jwtService.createJWT({ noteUniqueName })
        UserSessions.addUserSession(noteUniqueName, token)
        this.jwtService.sendJWTToClient(res, { token })
    }

    async logout(req: Request, res: Response, noteUniqueName: string): Promise<void> {
        const jwt = this.jwtService.extractJWTFromRequest(req)!
        UserSessions.removeUserSession(noteUniqueName, jwt)
        this.jwtService.removeJWTAtClient(res)
    }

    /**
     * Handler for checking authentication of client socket when init connection
     * @param socket client socket for authentication
     */
    async authSocketConnection(socket: Socket): Promise<TAuthSocketConnection> {
        const noteInfo = NoteService.getNoteCredentials(socket)
        if (!noteInfo) {
            throw new BaseCustomException(EAuthMessages.FAIL_TO_AUTH)
        }
        const { noteUniqueName } = await validateJson(noteInfo, NoteCredentialsDTO)
        const note = await this.noteService.findNote(noteUniqueName)
        if (!note) {
            throw new BaseCustomException(EAuthMessages.FAIL_TO_AUTH)
        }
        if (!note.password) {
            return { noteUniqueName }
        }
        const clientCookie = socket.handshake.headers.cookie
        if (!clientCookie) {
            throw new BaseCustomException(EValidationMessages.INVALID_CREDENTIALS)
        }
        const jwt = this.jwtService.extractJWTFromCookie(clientCookie)
        if (!jwt) {
            throw new BaseCustomException(EValidationMessages.INVALID_CREDENTIALS)
        }
        let jwtPayload: TJWTPayload
        try {
            jwtPayload = await this.jwtService.verifyToken(jwt)
        } catch (error) {
            throw new BaseCustomException(EAuthMessages.FAIL_TO_AUTH)
        }
        if (jwtPayload.noteUniqueName !== noteUniqueName) {
            throw new BaseCustomException(EAuthMessages.FAIL_TO_AUTH)
        }
        return { noteUniqueName }
    }

    async validateIncommingMessage(
        socket: Socket,
        noteUniqueName: string,
    ): Promise<TValidateIncommingSocketReturn> {
        const { cookie } = socket.handshake.headers
        const isWithPassword = UserSessions.checkNote(noteUniqueName)
        if (isWithPassword) {
            if (!cookie) {
                throw new CustomWsException(EValidationMessages.INVALID_INPUT, noteUniqueName)
            }
            const jwt = this.jwtService.extractJWTFromCookie(cookie)
            if (!jwt) {
                throw new CustomWsException(EValidationMessages.INVALID_CREDENTIALS, noteUniqueName)
            }
            const userExists = UserSessions.checkUserSessionIfExists(noteUniqueName, jwt)
            if (!userExists) {
                throw new CustomWsException(EValidationMessages.INVALID_CREDENTIALS, noteUniqueName)
            }
        }
        return { noteUniqueName }
    }
}
