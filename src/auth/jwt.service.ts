import type { TJwtCookieOptions, TJWTPayload, TSendJWTParamOptions } from './types'
import { JwtService } from '@nestjs/jwt'
import { Injectable } from '@nestjs/common'
import ms from 'ms'
import type { Response, Request, CookieOptions } from 'express'
import * as cookieParser from 'cookie'

@Injectable()
export class JWTService {
    private readonly jwtCookieOptions: TJwtCookieOptions = {
        maxAge: ms(process.env.JWT_MAX_AGE_IN_HOUR),
        domain: process.env.APPLICATION_DOMAIN_DEV,
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: true,
    }

    constructor(private jwtService: JwtService) {}

    extractJWTFromRequest(req: Request): string | null {
        return req.cookies[process.env.JWT_AUTH_COOKIE] || null
    }

    /**
     * extract jwt from cookies with structure such as: "my_cookie_name=value"
     * @param cookie cookie with structure such as: "auth_cookie=eyJhbGciOiJIUzIR5cCI6IkpXVCJ9"
     * @returns extracted jwt
     */
    extractJWTFromCookie(cookie: string): string | null {
        const parsed_cookie = cookieParser.parse(cookie) as TJWTPayload
        return parsed_cookie[process.env.JWT_AUTH_COOKIE] || null
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
        response.cookie(process.env.JWT_AUTH_COOKIE, token, cookieOtps || this.jwtCookieOptions)
    }

    removeJWTAtClient(response: Response, cookieOtps?: CookieOptions): void {
        response.clearCookie(process.env.JWT_AUTH_COOKIE, cookieOtps || this.jwtCookieOptions)
    }
}
