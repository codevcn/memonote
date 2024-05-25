import type { TJWTPayload, TSendJWTParamOptions } from './types'
import { JwtService } from '@nestjs/jwt'
import { EClientCookieNames } from '@/utils/enums'
import { Injectable } from '@nestjs/common'
import type { IJWTService } from './interfaces'
import ms from 'ms'
import type { Response, Request, CookieOptions } from 'express'

@Injectable()
export class JWTService implements IJWTService {
    jwtCookieOptions = {
        maxAge: ms(process.env.JWT_MAX_AGE_IN_HOUR),
        domain: process.env.APPLICATION_DOMAIN_DEV,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: true,
    }

    constructor(private jwtService: JwtService) {}

    extractJWTToken(req: Request): string | null {
        return req.cookies[EClientCookieNames.JWT_TOKEN_AUTH] || null
    }

    async createJWT(payload: TJWTPayload): Promise<string> {
        return await this.jwtService.signAsync(payload)
    }

    async verifyToken(token: string): Promise<TJWTPayload> {
        return await this.jwtService.verifyAsync<TJWTPayload>(token, {
            secret: process.env.JWT_SECRET,
        })
    }

    sendJWTToClient(response: Response, { token, cookieOtps }: TSendJWTParamOptions): void {
        response.cookie(
            EClientCookieNames.JWT_TOKEN_AUTH,
            token,
            cookieOtps || this.jwtCookieOptions,
        )
    }

    removeJWTAtClient(response: Response, cookieOtps?: CookieOptions): void {
        response.clearCookie(EClientCookieNames.JWT_TOKEN_AUTH, cookieOtps || this.jwtCookieOptions)
    }
}
