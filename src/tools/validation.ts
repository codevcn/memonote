import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { TranscriptAudioService } from './transcribe-audio.service.js'

export function ValidAudio(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return new Promise((resolve, reject) => {
                        if (value instanceof Buffer) {
                            TranscriptAudioService.isValidAudio(value)
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
