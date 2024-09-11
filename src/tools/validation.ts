import { FileValidator } from '@nestjs/common'
import { TMulterFile } from './types.js'
import { TranscribeAudioService } from './transcribe-audio.service.js'
import { EAudioMessages } from './messages.js'
import { readFile } from 'fs/promises'
import AppRootPath from 'app-root-path'
import { join } from 'path'

export class ValidateAudioFile extends FileValidator {
    async isValid(file?: TMulterFile): Promise<boolean> {
        console.log('>>> run this validate audio file >>>', file)
        console.log('>>> run this type of file >>>', typeof file)
        if (file) {
            try {
                const buffer = await readFile(join(AppRootPath.path, file.path))
                await TranscribeAudioService.isValidAudio(buffer)
            } catch (error) {
                console.log('>>> error after validating >>>', error)
                return false
            }
            console.log('>>> run this validate audio success')
            return true
        }
        return false
    }

    buildErrorMessage(file: TMulterFile): string {
        console.log('>>> run this build error message')
        return 'oke file audio'
    }
}
