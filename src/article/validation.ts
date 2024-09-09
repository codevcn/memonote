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
                validate(value: unknown, args: ValidationArguments) {
                    return new Promise<boolean>((resolve, reject) => {
                        if (value instanceof Buffer) {
                            FileServerService.isValidImage(value)
                                .then(() => {
                                    resolve(true)
                                })
                                .catch(() => {
                                    resolve(false)
                                })
                        }
                        resolve(false)
                    })
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
                    return new Promise((resolve, reject) => {
                        FileServerService.validateImgSrcList(value)
                            .then(() => {
                                resolve(true)
                            })
                            .catch(() => {
                                resolve(false)
                            })
                    })
                },
            },
        })
    }
}
