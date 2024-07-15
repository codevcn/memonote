import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import { ECookies, ELangCodes } from './enums'
import { I18nContext } from 'nestjs-i18n'

export const Lang = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const { cookies } = ctx.switchToHttp().getRequest<Request>()
    return cookies[ECookies.LANG] || I18nContext.current()?.lang || ELangCodes.EN
})
