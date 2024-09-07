import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { FileServerService } from './file-server.service'

export function ValidChunk(size: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'ValidChunk',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const stringSizeInBytes = Buffer.byteLength(value, 'utf8')
                    return stringSizeInBytes > 0 && stringSizeInBytes <= size
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
                validate(value: unknown, args: ValidationArguments) {
                    return value instanceof ArrayBuffer
                },
            },
        })
    }
}

export function ValidImage(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            async: true,
            validator: {
                validate(value: unknown, args: ValidationArguments) {
                    if (value instanceof Buffer) {
                        return FileServerService.isValidImage(value)
                    }
                    return Promise.resolve(false)
                },
            },
        })
    }
}

export function ValidImageSrcList(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            async: true,
            validator: {
                validate(value: string[], args: ValidationArguments) {
                    return FileServerService.validateImgSrcList(value)
                },
            },
        })
    }
}
