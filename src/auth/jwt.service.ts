import type { TJWTPayload, TSendJWTParams, TRemoveJWTParams } from './types'
import { JwtService } from '@nestjs/jwt'
import { EClientCookieNames } from '@/utils/enums'
import { Injectable } from '@nestjs/common'
import type { IJWTService } from './interfaces'
import ms from 'ms'
import type { Response, Request } from 'express'

@Injectable()
export class JWTService implements IJWTService {
    private jwtCookieOptions = {
        maxAge: ms(process.env.JWT_MAX_AGE_IN_HOUR),
        domain: process.env.APPLICATION_DOMAIN_DEV,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: true,
    }

    constructor(private jwtService: JwtService) {}

    getJWTcookieOtps() {
        return this.jwtCookieOptions
    }

    extractJWTToken(req: Request): string | null {
        return req.cookies[EClientCookieNames.JWT_TOKEN_AUTH] || null
    }

    async createJWT(payload: TJWTPayload) {
        return await this.jwtService.signAsync(payload)
    }

    async verifyToken(token: string) {
        return await this.jwtService.verifyAsync<TJWTPayload>(token, {
            secret: process.env.JWT_SECRET,
        })
    }

    sendJWTToClient(response: Response, { token, cookieOtps }: TSendJWTParams) {
        response.cookie(
            EClientCookieNames.JWT_TOKEN_AUTH,
            token,
            cookieOtps || this.getJWTcookieOtps(),
        )
    }

    removeJWTAtClient(response: Response, { cookieOtps }: TRemoveJWTParams) {
        response.clearCookie(
            EClientCookieNames.JWT_TOKEN_AUTH,
            cookieOtps || this.getJWTcookieOtps(),
        )
    }
}
