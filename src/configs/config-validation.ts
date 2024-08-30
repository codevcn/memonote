import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'

export const validationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: (errors: ValidationError[]) => {
        console.error('>>> print errors DTO validation >>>', errors)
        return new BadRequestException(
            errors.map(({ constraints }) => constraints && constraints.matches),
        )
    },
})
