import { BadRequestException, ValidationError, ValidationPipe } from '@nestjs/common'

const exceptionConvertor = (errors: ValidationError[]) => {
    console.log('>>> errors config validation 4 >>>', errors)
    return new BadRequestException(
        errors.map(({ constraints }) => constraints && constraints.matches),
    )
}

export const validationPipe = new ValidationPipe({
    transform: true,
    exceptionFactory: exceptionConvertor,
})
