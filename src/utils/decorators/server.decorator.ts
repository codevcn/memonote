import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export const ServerEndpoint = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const { headers, protocol } = ctx.switchToHttp().getRequest<Request>()
    return `${protocol}://${headers.host}`
})
