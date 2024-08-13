import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { TServerEndpoint } from './types'

export const ServerEndpoint = createParamDecorator<unknown, ExecutionContext, TServerEndpoint>(
    (data: unknown, ctx: ExecutionContext) => {
        const { protocol, hostname } = ctx.switchToHttp().getRequest<Request>()
        return {
            hostname,
            protocol,
        }
    },
)
