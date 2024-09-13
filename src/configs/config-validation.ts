import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'
import { performAsync } from '../temp/helpers.js'

enum EValidationPipeMessages {
    INVALID_INPUT = 'Invalid input',
}

export const apiValidationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
        performAsync(async () => {
            console.error('>>> print errors DTO validation >>>', errors)
        })
        return new BadRequestException(EValidationPipeMessages.INVALID_INPUT)
    },
})

export const wsValidationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
        performAsync(async () => {
            console.error('>>> print errors DTO validation >>>', errors)
        })
        return new BadRequestException(EValidationPipeMessages.INVALID_INPUT)
    },
})
