import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { EArticleFiles } from './enums'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { EArticleMessages } from './messages'

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
                    return value instanceof Buffer && value.byteLength <= size
                },
            },
        })
    }
}

export async function validateInputImgList(imgURLs: string[]): Promise<void> {
    const lenOfList = imgURLs.length
    if (lenOfList === 0) {
        throw new BaseCustomException(EArticleMessages.EMPTY_IMAGES)
    }
    if (lenOfList > EArticleFiles.MAX_IMAGES_COUNT) {
        throw new BaseCustomException(EArticleMessages.MAXIMUM_IMAGES_COUNT)
    }
}
