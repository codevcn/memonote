import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { FileServerService } from './file-server.service.js'
import { EArticleChunk } from './constants.js'

export function ValidChunk(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: string, args: ValidationArguments) {
                    const stringSizeInBytes = Buffer.byteLength(value, 'utf8')
                    return (
                        stringSizeInBytes > 0 && stringSizeInBytes <= EArticleChunk.SIZE_PER_CHUNK
                    )
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
                async validate(value: unknown, args: ValidationArguments) {
                    if (value instanceof Buffer) {
                        try {
                            await FileServerService.isValidImage(value)
                        } catch (error) {
                            return false
                        }
                        return true
                    }
                    return false
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
                async validate(value: string[], args: ValidationArguments) {
                    try {
                        await FileServerService.validateImgSrcList(value)
                    } catch (error) {
                        return false
                    }
                    return true
                },
            },
        })
    }
}
