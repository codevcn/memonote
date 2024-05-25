import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseCustomException extends HttpException {
    private originalException: any
    private type: string

    constructor(
        message: string,
        statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
        type: string = 'Unknown',
        originalException: any = new Error('Something went wrong...'),
    ) {
        super(message, statusCode)
        this.name = 'Base Custom Exception'
        this.originalException = originalException
        this.type = type
    }
}

export class UserException extends BaseCustomException {
    constructor(message: string, statusCode: number) {
        super(message, statusCode)
        this.name = 'User Exception'
    }
}
