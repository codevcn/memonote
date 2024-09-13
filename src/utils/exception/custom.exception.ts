import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseCustomException extends HttpException {
    type: string = 'unknown'

    constructor(
        message: string,
        statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
        type?: string,
    ) {
        super(message, statusCode)
        this.name = 'Base Custom Exception'
        if (type) {
            this.type = type
        }
    }
}

export class UserException extends BaseCustomException {
    constructor(message: string, statusCode: number) {
        super(message, statusCode)
        this.name = 'User Exception'
    }
}
