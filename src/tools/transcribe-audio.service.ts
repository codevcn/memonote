import { Injectable } from '@nestjs/common'
import AppRoot from 'app-root-path'
import path, { join } from 'path'
import { createClient, DeepgramClient } from '@deepgram/sdk'
import { createReadStream, ReadStream } from 'fs'
import { readFile, unlink } from 'fs/promises'
import type { TTranscribeAudioFile, TTranscribeAudio } from './types.js'
import { BaseCustomException } from '../utils/exception/custom.exception.js'
import { EAudioMessages } from './messages.js'
import { EAudioFiles, EAudioLangs } from './constants.js'
import { fileTypeFromBuffer } from 'file-type'
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface.js'
import multer from 'multer'
import type { Request, Response } from 'express'
import { NoteUniqueNameDTO } from '../note/DTOs.js'
import { validateJson } from '../utils/helpers.js'

const test = [
    'Anh sẽ chỉ cho các bạn một cách để phát hiện và vô hiệu hóa các camera quay lén Mà chỉ cần sử dụng mỗi camera điện thoại thôi chứ không cần thêm thiết bị thứ ba Camera quay lén lên nó có hai loại Một loại là trang bị thêm đèn hồng ngoại để nhìn vào đêm Còn một loại lại không có đèn hồng ngoại nên chỉ nhìn được khi có đủ ánh sáng Với cái loại mà dùng đèn hồng ngoại thì mình chỉ cần dùng camera iPhone Đầu tiên là mình tắt thiết điện đi kéo cửa sổ vào để cho phòng khoảng băng tối Sau đó đứng ở những vị trí mà nghi ngờ là sẽ bị quay nén ở vị trí đấy Dùng camera iPhone ở chế độ thường lia xung quanh để kiểm tra xem có con mắt nào đang hướng về tôi hay không Nếu mà nó chớp chớp chớp đỏ thì đấy chính là cái chỗ phát ra tia hồng ngoại Nhìn anh thấy này nó chớp không? Có Đấy! Nhưng mà mắt thường thì sẽ không nhìn thấy Ơ nhờ! Thấy thật luôn! Còn đây là camera iPhone nó bắt được tia hồng ngoại Mà bên cạnh cái đèn đấy thường nó sẽ có camera Phương pháp này thì sẽ không phát hiện được những camera không trang bị thêm đèn hồng ngoại nhưng mà như thế thì không cần tại vì tắt đèn đi là vội hóa được nó rồi',
    'Một thằng con trai mà không gái gú, rượu chè, thuốc lá là do nó không có tiền mua những cái đấy. May mắn là tôi được đẻ ra trong một gia đình khá giả. Chữ khá ở đây nó là giả đấy. Trong tình yêu được cái câu Em là tất cả cuộc đời anh nó không thực sự lãng mạn đến thế vì nếu ngoài em ra anh chả có gì thì gay to đấy. Bằng chứng cho việc một người thực sự nghèo là sở hữu sổ hộ nghèo, thứ mà bây giờ chủ yếu là dùng để xin húp trước. Có thể ví người nghèo giống như chủ nghĩa hư vô, vì nói cách khác là ví họ như không có gì cả. Một anh nhà giàu chơi xe tăng từng nói thế này: Dù giàu hay nghèo thì chết cũng chỉ có 2m đất, cơm cũng ngày ba bữa là đủ, nhà đẹp hay xấu, chui vào ngủ là được. Câu trên mà người giàu nói thì được kính phục, nể trọng. Người nghèo nó thì bị coi là không có chí tiến thủ. Như đã nói trong video đơn giản hóa YouTube thì tôi chỉ ước là làm YouTube có một ngày nghèo thôi chứ ngày nào cũng nghèo mệt lắm Tại vì nghèo thì thường đi đôi với nhiều thứ, nghèo đi kèm với đói, ăn xin thì đói ăn đói mặc, nghệ sĩ thì đói fame, nghèo còn đi đôi với bẩn. Sự nghèo đói là nguồn cảm hứng sáng tác cho nhiều tác phẩm nghệ thuật và là nguồn content bẩn vô tận của các tik tok Nghèo thì còn đi đôi với rách Minh chứng là các anh có tên như này thì nói lên tất cả Anh Jack này thì nghèo vật chất nhưng giàu nhân cách, còn anh Jack này thì rất giàu vật chất Nhưng mà bần cùng thì sinh đạo tặc Vậy nên trong xã hội người nghèo thường bị nó là không đáng tin cậy và hay bị nghi ngờ Nhưng mà trừ tôi ra vì khi tôi bảo là tôi nghèo thì không ai nghi ngờ điều đấy cả Giấu được giàu chứ không ai giấu được nghèo Đúng thật là Thái Công có thể chẳng biết bạn giấu tiền ở đâu nhưng mà thằng trộm kiểu gì cũng biết',
    '',
]

@Injectable()
export class TranscribeAudioService {
    static readonly audiosDirname: string = 'temp-audios'
    static readonly audiosDirPath: string = join(
        AppRoot.path,
        'src',
        'tools',
        TranscribeAudioService.audiosDirname,
    )
    static readonly supportedAudiotypes = ['audio/mpeg', 'audio/wav']
    private readonly deepgramClient: DeepgramClient = createClient(process.env.DEEPGRAM_API_KEY)
    private readonly deepGramModelForTranscribe: string = 'nova-2'

    static formatAudioFilename(noteUniqueName: string, nameWithExt: string): string {
        return `${noteUniqueName}-${Date.now()}${path.extname(nameWithExt)}`
    }

    static initTranscribeAudioSaver = (): MulterOptions => {
        return {
            storage: multer.diskStorage({
                destination: function (req: Request, file, cb) {
                    cb(null, TranscribeAudioService.audiosDirPath)
                },
                filename: function (req: Request, file, cb) {
                    const { noteUniqueName } = req.params
                    cb(
                        null,
                        TranscribeAudioService.formatAudioFilename(
                            noteUniqueName,
                            file.originalname,
                        ),
                    )
                },
            }),
            limits: {
                fileSize: EAudioFiles.MAX_FILE_SIZE,
                fieldNameSize: EAudioFiles.MAX_FILENAME_SIZE,
                files: EAudioFiles.MAX_FILES_COUNT,
            },
            fileFilter: function (req: Request, file, cb) {
                const { originalname } = file
                if (!file || !originalname) {
                    cb(new BaseCustomException(EAudioMessages.EMPTY_FILE_INPUT), false)
                    return
                }
                if (!path.extname(originalname)) {
                    cb(new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT), false)
                    return
                }
                validateJson(req.params, NoteUniqueNameDTO)
                    .then(() => {
                        cb(null, true)
                    })
                    .catch(() => {
                        cb(new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT), false)
                    })
            },
        }
    }

    private async transcribeAudio(
        fileStream: ReadStream,
        audioLang: EAudioLangs,
    ): Promise<TTranscribeAudio> {
        const { result, error } = await this.deepgramClient.listen.prerecorded.transcribeFile(
            fileStream,
            {
                model: this.deepGramModelForTranscribe,
                smart_format: true,
                punctuate: true,
                paragraphs: true,
                language: audioLang,
            },
        )
        if (error) {
            throw error
        }
        const { transcript, confidence } = result.results.channels[0].alternatives[0]
        return { transcription: transcript, confidence }
    }

    private async transcribeAudios(
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        res: Response,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            let transcribedCount: number = 0
            for (const audio of audioFiles) {
                const readStream = createReadStream(audio.path)
                const audioFilename = audio.filename,
                    audioOriginalName = audio.originalname
                this.transcribeAudio(readStream, audioLang)
                    .then((result) => {
                        res.write(
                            JSON.stringify({
                                ...result,
                                audioId: audioFilename, // set audio id as saved audio filename
                                audioFilename: audioOriginalName,
                            }),
                        )
                    })
                    .catch((error) => {
                        res.write(
                            JSON.stringify({
                                error,
                                audioId: audioFilename,
                                audioFilename: audioOriginalName,
                            }),
                        )
                    })
                    .finally(() => {
                        readStream.destroy()
                        transcribedCount++
                        if (transcribedCount === audioFiles.length) {
                            resolve()
                        }
                    })
            }
        })
    }

    async transcribeAudiosHandler(
        audioFiles: Array<TTranscribeAudioFile>,
        audioLang: EAudioLangs,
        res: Response,
    ): Promise<void> {
        await this.transcribeAudios(audioFiles, audioLang, res)
    }

    async transcribeAudioHandler(
        audio: TTranscribeAudioFile,
        audioLang: EAudioLangs,
    ): Promise<TTranscribeAudio> {
        return await this.transcribeAudio(createReadStream(audio.path), audioLang)
    }

    async cleanUpWhenTranscribeDone(files: Array<TTranscribeAudioFile>): Promise<void> {
        const deletePromises = files.map((file) => unlink(file.path))
        await Promise.all(deletePromises)
    }

    static async isValidAudio(fileBuffer: Buffer, fileExtension: string): Promise<void> {
        const fileType = await fileTypeFromBuffer(fileBuffer)
        if (!fileType) {
            throw new BaseCustomException(EAudioMessages.UNABLE_HANDLED_FILE_INPUT)
        }
        if (fileType.ext !== fileExtension) {
            throw new BaseCustomException(EAudioMessages.CONTENT_CONFLICT_EXT)
        }
        const isValid = this.supportedAudiotypes.includes(fileType.mime)
        if (!isValid) {
            throw new BaseCustomException(EAudioMessages.UNSUPPORTED_FILE_TYPE)
        }
    }

    async validateMulterStoredFile(file: TTranscribeAudioFile): Promise<void> {
        const buffer = await readFile(file.path)
        const fileExtension = path.extname(file.originalname).slice(1)
        await TranscribeAudioService.isValidAudio(buffer, fileExtension)
    }

    async validateMulterStoredFiles(files: Array<TTranscribeAudioFile>): Promise<void> {
        const promises: Promise<void>[] = []
        for (const file of files) {
            promises.push(this.validateMulterStoredFile(file))
        }
        await Promise.all(promises)
    }
}
