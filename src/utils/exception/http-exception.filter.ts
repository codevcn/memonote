import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import type { Response } from 'express'
import { HttpExceptionValidation } from '../validation/http-exception.validation'
import type { THttpExceptionResBody } from '../types'
import { ClientViewPages } from '../application/view-pages'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private httpExceptionValidation: HttpExceptionValidation) {}

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const validatedException = this.httpExceptionValidation.validateException(exception)

        const response = ctx.getResponse<Response<THttpExceptionResBody>>()

        if (validatedException.status === HttpStatus.NOT_FOUND) {
            response.status(HttpStatus.NOT_FOUND).render(ClientViewPages.page404)
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
