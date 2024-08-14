import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'
import { HttpExceptionValidation } from '../validation/http-exception.validation'
import type { TCommonPageData, THttpExceptionResBody } from '../types'
import { ClientViewPages } from '../application/view-pages'
import { I18nContext } from 'nestjs-i18n'
import { createClientPageData } from '../helpers'
import { ApplicationService } from '../application/application.service'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
    constructor(private httpExceptionValidation: HttpExceptionValidation) {}

    private isAPIException(request: Request): boolean {
        return request.path.search('/api/') !== -1
    }

    async catch(exception: HttpException, host: ArgumentsHost) {
        console.error('\n>>> http error >>>', exception)

        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response<THttpExceptionResBody>>()
        const request = ctx.getRequest<Request>()
        const i18n = I18nContext.current(host)

        const validatedException = this.httpExceptionValidation.validateException(exception)

        if (this.isAPIException(request)) {
            response.status(validatedException.status).json({
                name: validatedException.name,
                message: validatedException.message,
                timestamp: new Date(),
                isUserException: validatedException.isUserException,
                status: validatedException.status,
                lang: i18n?.lang || 'unknown',
            })
        } else {
            if (validatedException.status === HttpStatus.NOT_FOUND) {
                const appInfo = await ApplicationService.getApplicationInfo()
                response.status(HttpStatus.NOT_FOUND).render(
                    ClientViewPages.page404,
                    createClientPageData<TCommonPageData>({
                        appInfo,
                        verified: false,
                    }),
                )
            } else {
                response.status(validatedException.status).render(ClientViewPages.error, {
                    name: validatedException.name,
                    message: validatedException.message,
                    timestamp: new Date(),
                    isUserException: validatedException.isUserException,
                    status: validatedException.status,
                })
            }
        }
    }
}
