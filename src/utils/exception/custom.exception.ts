import { HttpException, HttpStatus } from '@nestjs/common'

export class BaseCustomException extends HttpException {
    constructor(message: string, statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR) {
        super(message, statusCode)
        this.name = 'Custom Exception'
    }
}

export class UserException extends BaseCustomException {
    constructor(message: string, statusCode: number) {
        super(message, statusCode)
        this.name = 'User Exception'
    }
}
