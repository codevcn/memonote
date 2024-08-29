import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

export function ValidChunk(size: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const stringSizeInBytes = Buffer.byteLength(value, 'utf8')
                    return stringSizeInBytes <= size
                },
            },
        })
    }
}

export function IsArrayBuffer(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return value instanceof ArrayBuffer
                },
            },
        })
    }
}

export function ValidImage(size: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return value instanceof ArrayBuffer && value.byteLength <= size
                },
            },
        })
    }
}
