import { Injectable } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { ECookies, ELangCodes } from './enums'
import type { Response } from 'express'
import { TLangCookieOptions } from './types'
import ms from 'ms'

@Injectable()
export class LangService {
    private readonly langCookie: TLangCookieOptions = {
        maxAge: ms('3 months'),
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: true,
    }

    getCurrentLang(): string {
        return I18nContext.current()?.lang || ELangCodes.EN
    }

    getSupportedLangs(): string[] {
        return Object.values(ELangCodes)
    }

    requestLang(res: Response, langCode: string): void {
        res.cookie(ECookies.LANG, langCode, this.langCookie)
    }
}
