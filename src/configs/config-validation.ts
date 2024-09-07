import {
    BadRequestException,
    ValidationError,
    ValidationPipe,
    ValidationPipeOptions,
} from '@nestjs/common'

const exceptionFactory = (errors: ValidationError[]) => {
    console.error('>>> print errors DTO validation >>>', errors)
    return new BadRequestException(
        errors.map(({ constraints }) => constraints && constraints.matches),
    )
}

const validatePipeOptions: ValidationPipeOptions = {
    transform: true,
    exceptionFactory,
    validateCustomDecorators: true,
}

export const apiValidationPipe = new ValidationPipe({ ...validatePipeOptions })

export const wsValidationPipe = new ValidationPipe({ ...validatePipeOptions })
