type TTranscribeAudioPld = {
    chunk: File
    totalChunks: number
    uploadId: string
}

type TTranscribeAudioData = {
    audioId: string
    transcription: string | null
    audioFilename: string
}

type TPickedAudioFile = {
    audioId: string
    audioFile: File
}

type TPickedImageFile = {
    imgURL: string
    imageFile: File
}

type TImageAllowedExt = {
    exts: string[]
    magicNumber: string
}

type TRecognitionWorker = {
    langs: TImageLangs[]
    worker: NSTesseract.Worker
}

type TRecognitionImageData = {
    transcription: string
}

class TranscribeAudioController {
    private static transcriptionsData: TTranscribeAudioData[] = []
    private static focusedTranscriptionIndex: number = -1
    private static pickedAudioFiles: TPickedAudioFile[] = []

    private static readonly transcriptionResultEle = document.querySelector(
        '#transcribe-audio-container .transcription-result',
    ) as HTMLElement
    private static readonly transcribedFilesEle = this.transcriptionResultEle.querySelector(
        '.transcribed-files',
    ) as HTMLSelectElement

    static setTranscriptionsData(transcriptions: TTranscribeAudioData[]): void {
        this.transcriptionsData = transcriptions
    }

    static addTranscriptionsData(...transcription: TTranscribeAudioData[]): void {
        this.transcriptionsData.push(...transcription)
    }

    static setSubmitLoading(loading: boolean): void {
        const submitBtn = document.querySelector(
            '#transcribe-audio-form .submit-btn',
        ) as HTMLElement
        if (loading) {
            submitBtn.classList.add('loading')
            submitBtn.innerHTML = Materials.createHTMLLoading('border')
        } else {
            submitBtn.classList.remove('loading')
            submitBtn.innerHTML = `
                <i class="bi bi-cloud-upload"></i>
                <span>Transcribe</span>`
        }
    }

    static setTranscribeAudioStatus(
        audioId: string,
        status: 'loading' | 'success' | 'error' | 'info',
    ): void {
        const pickedFile = document.querySelector(
            `#transcribe-audio-form .upload-box .picked-audio-files .files-list .file-item[data-audio-id="${audioId}"]`,
        ) as HTMLElement
        pickedFile.classList.remove('loading', 'success', 'error', 'info')
        pickedFile.classList.add(status)
    }

    private static validatePickedAudios(files: File[]): boolean {
        for (const file of files) {
            const fileSize = file.size
            if (!file || fileSize === 0) {
                this.setMessage('Please pick a file!')
                return false
            }
            const maxFileSize = EAudioFiles.MAX_FILE_SIZE
            if (fileSize > maxFileSize) {
                this.setMessage(`Audio file must be ${maxFileSize} or lower.`)
                return false
            }
            const maxFilenameSize = EAudioFiles.MAX_FILENAME_SIZE
            if (countBytesOfString(file.name) > maxFilenameSize) {
                this.setMessage(`Audio filename must be ${maxFilenameSize} or lower.`)
                return false
            }
        }
        return true
    }

    private static validateBeforeSubmit(audios: TPickedAudioFile[]): boolean {
        if (!audios || audios.length === 0) {
            this.setMessage('Please pick a file!')
            return false
        }
        return true
    }

    private static createFormData(audioFile: File, lang: TAudioLangs): FormData {
        const formData = new FormData()
        formData.set('audioFile', audioFile)
        formData.set('audioLang', lang)
        formData.set('clientSocketId', normalEditorSocket.getSocketId())
        return formData
    }

    static async transcribeAudiosHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const audios = this.pickedAudioFiles

        if (!this.validateBeforeSubmit(audios)) return

        const form = document.getElementById('transcribe-audio-form') as HTMLFormElement
        const formData = new FormData(form)
        const lang = formData.get('audio-language') as TAudioLangs
        this.setMessage(null)
        this.setSubmitLoading(true)
        this.resetDataAndUI()

        let transcribedCount: number = 0
        for (const audio of audios) {
            const audioId = audio.audioId
            this.setTranscribeAudioStatus(audioId, 'loading')
            transcribeAudioAPI(this.createFormData(audio.audioFile, lang))
                .then(({ data }) => {
                    const { transcription } = data
                    if (transcription && transcription.length > 0) {
                        this.setTranscribeAudioStatus(audioId, 'success')
                        const transcriptionData: TTranscribeAudioData = {
                            audioId,
                            audioFilename: audio.audioFile.name,
                            transcription,
                        }
                        this.addTranscriptionsData(transcriptionData)
                        this.addTranscriptions(transcriptionData)
                    } else {
                        this.setTranscribeAudioStatus(audioId, 'error')
                    }
                })
                .catch((error) => {
                    this.setTranscribeAudioStatus(audioId, 'error')
                })
                .finally(() => {
                    transcribedCount++
                    if (transcribedCount === audios.length) {
                        this.setSubmitLoading(false)
                        this.setMessage('All the audios are transcribed!', true)
                    }
                })
        }
    }

    private static setMessage(message: string | null, success?: boolean): void {
        const messageContainer = document.getElementById('transcribe-audio-message') as HTMLElement
        messageContainer.classList.remove('active', 'success', 'error')
        if (message) {
            messageContainer.classList.add('active')
            messageContainer.querySelector('.message')!.textContent = message
            const iconSuccess = messageContainer.querySelector('.icon-success') as HTMLLIElement
            const iconError = messageContainer.querySelector('.icon-error') as HTMLLIElement
            iconSuccess.hidden = true
            iconError.hidden = true
            if (success) {
                iconSuccess.hidden = false
                messageContainer.classList.add('success')
            } else {
                iconError.hidden = false
                messageContainer.classList.add('error')
            }
        }
    }

    private static setTranscription(transcription: string | null, index: number): Promise<void> {
        this.focusedTranscriptionIndex = index
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = this.transcriptionResultEle.querySelector(
                    '.text-box',
                ) as HTMLElement
                textBox.textContent = transcription || ''
                resolve()
            }, 0)
        })
    }

    private static resetDataAndUI(): void {
        this.setTranscriptionsData([])
        this.transcribedFilesEle.innerHTML = ''
        this.setTranscription(null, 0)
    }

    private static addTranscriptions(transcription: TTranscribeAudioData): void {
        const transcribedFilesEle = this.transcribedFilesEle

        const option = document.createElement('option')
        option.value = transcription.audioId
        option.textContent = transcription.audioFilename

        transcribedFilesEle.appendChild(option)

        const transcriptionData = transcription.transcription
        if (transcriptionData && transcriptionData.length > 0) {
            option.selected = true
            this.setTranscription(transcriptionData, this.transcriptionsData.length - 1)
        }
    }

    static pickAudios(target: HTMLInputElement): void {
        const filesList = target.files
        if (filesList && filesList.length > 0) {
            const files = Array.from(filesList)
            if (this.validatePickedAudios(files)) {
                const audios = files.map<TPickedAudioFile>((file) => ({
                    audioId: `audio-id-${generateUploadId()}`,
                    audioFile: file,
                }))
                this.pickedAudioFiles = audios
                this.setUIForPickedFiles(audios)
                return
            }
            return
        }
        LayoutController.toast('error', 'Please pick a file')
    }

    private static setUIForPickedFiles(files: TPickedAudioFile[]): void {
        document
            .querySelector('#transcribe-audio-form .upload-box .upload-file')!
            .classList.remove('active')
        const pickedFiles = document.querySelector(
            '#transcribe-audio-form .upload-box .picked-audio-files',
        ) as HTMLElement
        pickedFiles.classList.add('active')
        const filesList = pickedFiles.querySelector('.files-list') as HTMLElement
        filesList.innerHTML = ''
        for (const file of files) {
            const filename = file.audioFile.name
            const fileEle = document.createElement('div')
            fileEle.setAttribute('data-audio-id', file.audioId)
            fileEle.className = 'file-item info'
            fileEle.innerHTML = `
                <i class="bi bi-file-earmark-music icon-info"></i>
                <i class="bi bi-check-circle-fill icon-success"></i>
                <i class="bi bi-x-circle-fill icon-error"></i>
                ${Materials.createHTMLLoading('border')}
                <span>${filename}</span>`
            fileEle.title = filename

            filesList.appendChild(fileEle)
        }
    }

    static handleTranscriptionActions(type: 'write' | 'copy'): void {
        const focusedTranscriptionIndex = this.focusedTranscriptionIndex
        if (focusedTranscriptionIndex < 0) return
        const transcription = this.transcriptionsData[focusedTranscriptionIndex].transcription
        if (transcription && transcription.length > 0) {
            const resultActions = this.transcriptionResultEle.querySelector(
                '.actions',
            ) as HTMLElement
            if (type === 'write') {
                addNewContentToNoteEditor(`\n\n${transcription}`)
                const writeToNoteAction = resultActions.querySelector('.write') as HTMLElement
                LayoutController.transitionBackwards(
                    writeToNoteAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Wrote</span>`,
                )
            } else {
                copyToClipboard(transcription)
                const copyAction = resultActions.querySelector('.copy') as HTMLElement
                LayoutController.transitionBackwards(
                    copyAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Copied</span>`,
                )
            }
        } else {
            this.setMessage('No transcription found!')
        }
    }

    static switchTranscriptions(): void {
        const transcriptions = this.transcriptionsData
        if (transcriptions && transcriptions.length > 0) {
            const transcribedFilesEle = this.transcribedFilesEle
            const audioId = transcribedFilesEle.value
            const index = transcriptions.findIndex(
                (transcription) => transcription.audioId === audioId,
            )!
            this.setTranscription(transcriptions[index].transcription, index)
        }
    }
}

class ImageRecognitionController {
    private static transcriptionsData: TRecognitionImageData | null = null
    private static pickedImageFile: TPickedImageFile | null = null
    private static readonly imageAllowedExts: TImageAllowedExt[] = [
        { exts: ['jpg', 'jpeg'], magicNumber: 'ffd8ffe0' },
        { exts: ['png'], magicNumber: '89504e47' },
        { exts: ['webp'], magicNumber: '52494646' },
    ]
    private static readonly transcriptionResultEle = document.querySelector(
        '#image-recognition-container .transcription-result',
    ) as HTMLElement
    private static readonly imageRecognitionForm = document.getElementById(
        'image-recognition-form',
    ) as HTMLFormElement
    private static workers: TRecognitionWorker[] = []
    private static readonly maxImgsCount: number = 5
    private static stage: any | null = null
    private static layer: any | null = null
    private static readonly stageId: string = 'recognition-result-preview'

    static setTranscriptionsData(transcription: TRecognitionImageData): void {
        this.transcriptionsData = transcription
    }

    private static async createWorker(
        imageLangs: TImageLangs[],
        logger: (status: string, progress: string) => void,
        errorHandler: (error: any) => void,
    ): Promise<NSTesseract.Worker> {
        const workers = this.workers
        let worker =
            workers.length > 0
                ? workers.find(({ langs }) => langs.every((lang) => imageLangs.includes(lang)))
                      ?.worker
                : null
        if (!worker) {
            worker = await Tesseract.createWorker(imageLangs, 1, {
                errorHandler,
                logger: (m: any) => {
                    logger(m.status, m.progress)
                },
            })
            this.workers.push({ langs: imageLangs, worker })
        }
        return worker
    }

    static async pickImages(target: HTMLInputElement): Promise<void> {
        const filesList = target.files
        if (filesList && filesList.length > 0) {
            const uploadBox = document.querySelector(
                '#image-recognition-container .upload-box',
            ) as HTMLElement
            const beforeHTML = uploadBox.innerHTML
            uploadBox.innerHTML = Materials.createHTMLLoading('border')
            const files = Array.from(filesList)
            let isValid: boolean = false
            try {
                await this.validateImages(files)
                isValid = true
            } catch (error) {
                this.setMessage((error as BaseCustomError).message, false)
            }
            uploadBox.innerHTML = beforeHTML
            if (isValid) {
                if (this.pickedImageFile) {
                    URL.revokeObjectURL(this.pickedImageFile.imgURL)
                }
                const imageFile = filesList[0]
                this.pickedImageFile = {
                    imageFile,
                    imgURL: URL.createObjectURL(imageFile),
                }
                this.setUIForPickedFile(this.pickedImageFile)
            }
            return
        }
        LayoutController.toast('error', 'Please pick a file')
    }

    private static isValidImgType(file: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('load', (e) => {
                const fileAsArrayBuffer = e.target!.result as ArrayBuffer
                const uint8Array = new Uint8Array(fileAsArrayBuffer)
                const magicNumber = uint8Array.reduce(
                    (acc, byte) => acc + byte.toString(16).padStart(2, '0'),
                    '',
                )
                if (this.imageAllowedExts.map((ext) => ext.magicNumber).includes(magicNumber)) {
                    resolve()
                } else {
                    reject(new BaseCustomError('There is an image type not supported'))
                }
            })
            reader.readAsArrayBuffer(file.slice(0, 4))
        })
    }

    private static async validateImages(files: File[]): Promise<void> {
        if (files.length > this.maxImgsCount) {
            throw new BaseCustomError('Maximum number of images is ' + this.maxImgsCount)
        }
        await Promise.all(files.map((file) => ImageRecognitionController.isValidImgType(file)))
    }

    private static setUIForPickedFile(image: TPickedImageFile) {
        const imgName = image.imageFile.name
        this.imageRecognitionForm
            .querySelector('.upload-box')!
            .classList.replace('active-upload-file', 'active-picked-image-file')
        const pickedImageEle = this.imageRecognitionForm.querySelector(
            '.upload-box .picked-image-file',
        ) as HTMLElement
        pickedImageEle.classList.replace(`active-${this.stageId}`, 'active-pre-recognition-img')
        const imgTitle = pickedImageEle.querySelector('.image-title .text') as HTMLElement
        imgTitle.textContent = imgName
        imgTitle.title = imgName
        pickedImageEle.querySelector('.progress')!.outerHTML = Materials.createHTMLProgress(
            'success',
            0,
            'w-100 mt-3',
        )
        this.setRecognitionSwitchButton(false)
        document.getElementById('pre-recognition-img')!.innerHTML =
            `<img src="${image.imgURL}" alt="${imgName}" />`
    }

    private static async recognitionSingleImage(
        image: File,
        langs: TImageLangs[],
    ): Promise<NSTesseract.RecognizeResult> {
        const worker = await this.createWorker(
            langs,
            (status, progress) => {
                if (status === 'recognizing text') {
                    this.setRecognitionProgress(Number((Number(progress) * 100).toFixed(2)))
                }
            },
            (error) => {},
        )
        return await worker.recognize(image)
    }

    private static setRecognitionProgress(percent: number): void {
        const progress = this.imageRecognitionForm.querySelector(
            `.picked-image-file .progress`,
        ) as HTMLElement
        progress.classList.add('active')
        const progressBar = progress.querySelector('.progress-bar') as HTMLElement
        progressBar.style.width = `${percent}%`
        progressBar.textContent = `${percent}%`
        if (percent === 100) {
            progressBar.classList.remove('progress-bar-animated')
        }
    }

    private static selectWordOnRecognitionRect(word: string, selectedRect: any): void {
        console.log('>>> word selected >>>', word)
        const rects = this.layer.find('Rect')
        for (const rect of rects) {
            rect.stroke('red')
            rect.strokeWidth(2)
        }

        selectedRect.stroke('blue')
        selectedRect.strokeWidth(3)
        this.layer.draw()

        const mousePos = this.stage.getPointerPosition()
        const recognitionPopover = document.getElementById(
            'recognition-result-popover',
        ) as HTMLElement
        this.showPopoverOnSelectWord(false, recognitionPopover)
        recognitionPopover.style.left = `${mousePos.x}px`
        recognitionPopover.style.top = `${mousePos.y}px`
        recognitionPopover.querySelector('.text')!.textContent = word
    }

    static showPopoverOnSelectWord(hidden: boolean, popover?: HTMLElement): void {
        if (popover) {
            popover.hidden = hidden
        } else {
            document.getElementById('recognition-result-popover')!.hidden = hidden
        }
    }

    private static setupRecognitionResult(
        recognitionResult: NSTesseract.RecognizeResult,
        imageURL: string,
        stageWidth: number,
        stageHeight: number,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const stage = new Konva.Stage({
                    container: this.stageId,
                    width: stageWidth,
                    height: stageHeight,
                })
                const layer = new Konva.Layer()
                stage.add(layer)

                const { words } = recognitionResult.data

                const imageEle = new Image()
                imageEle.onload = () => {
                    // Calculate the scale between image size and canvas size
                    const imgWidth = imageEle.width
                    const imgHeight = imageEle.height
                    const canvasWidth = stage.width()
                    const canvasHeight = stage.height()
                    const scaleX = canvasWidth / imgWidth
                    const scaleY = canvasHeight / imgHeight

                    // Draw the image on Konva
                    const image = new Konva.Image({
                        x: 0,
                        y: 0,
                        image: imageEle,
                        width: canvasWidth,
                        height: canvasHeight,
                    })
                    layer.add(image)

                    // Draw bounding boxes for detected words
                    let index: number = 0
                    for (const word of words) {
                        const { bbox } = word // Get bounding box for each word

                        const rect = new Konva.Rect({
                            x: bbox.x0 * scaleX,
                            y: bbox.y0 * scaleY,
                            width: (bbox.x1 - bbox.x0) * scaleX,
                            height: (bbox.y1 - bbox.y0) * scaleY,
                            stroke: 'red',
                            strokeWidth: 2,
                            draggable: false,
                        })

                        // Add click event to display text when box is clicked
                        rect.on('click', () => {
                            this.selectWordOnRecognitionRect(word.text, rect)
                        })

                        layer.add(rect)
                        index++
                    }

                    layer.draw()
                }
                imageEle.crossOrigin = 'Anonymous' // Để tránh vấn đề CORS nếu hình ảnh từ domain khác
                imageEle.src = imageURL

                this.stage = stage
                this.layer = layer

                resolve()
            }, 0)
        })
    }

    private static async visualizeRecognitionResult(
        recognitionResult: NSTesseract.RecognizeResult,
        imageURL: string,
    ): Promise<void> {
        const imgPreview = document.querySelector('#pre-recognition-img img') as HTMLImageElement
        const stageWidth = imgPreview.clientWidth
        const stageHeight = imgPreview.clientHeight
        this.switchRecognition(`active-${this.stageId}`)
        await this.setupRecognitionResult(recognitionResult, imageURL, stageWidth, stageHeight)
    }

    private static setRecognitionSwitchButton(active: boolean): void {
        const switchBtn = this.imageRecognitionForm.querySelector(
            '.header .form-switch',
        ) as HTMLElement
        switchBtn.classList.remove('active')
        if (active) {
            switchBtn.classList.add('active')
        }
    }

    static async recognizeImageHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const pickedImage = this.pickedImageFile!
        const formData = new FormData(this.imageRecognitionForm)
        const imageLangs = formData.getAll('image-lang') as TImageLangs[]
        const submitBtn = this.imageRecognitionForm.querySelector('.submit-btn') as HTMLElement
        submitBtn.innerHTML = Materials.createHTMLLoading('border')
        submitBtn.classList.add('loading')
        let result: NSTesseract.RecognizeResult | null = null
        try {
            result = await this.recognitionSingleImage(pickedImage.imageFile, imageLangs)
        } catch (error) {
            this.setMessage('Fail to recognize the image')
        }
        if (result) {
            const transcription = result.data.text
            this.setRecognitionSwitchButton(true)
            this.visualizeRecognitionResult(result, pickedImage.imgURL).then(() => {
                this.setTranscriptionsData({ transcription })
                this.setTranscription(transcription)
            })
        }
        submitBtn.innerHTML = 'Recognize'
        submitBtn.classList.remove('loading')
    }

    static switchRecognition(switchTo?: string): void {
        const pickedImgFile = this.imageRecognitionForm.querySelector(
            '.picked-image-file',
        ) as HTMLElement
        if (switchTo) {
            pickedImgFile.classList.remove('active-pre-recognition-img', `active-${this.stageId}`)
            pickedImgFile.classList.add(switchTo)
        } else {
            if (pickedImgFile.classList.contains('active-pre-recognition-img')) {
                pickedImgFile.classList.replace(
                    'active-pre-recognition-img',
                    `active-${this.stageId}`,
                )
            } else {
                pickedImgFile.classList.replace(
                    `active-${this.stageId}`,
                    'active-pre-recognition-img',
                )
            }
        }
    }

    private static setTranscription(transcription: string | null): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = this.transcriptionResultEle.querySelector(
                    '.text-box',
                ) as HTMLElement
                textBox.textContent = transcription || ''
                resolve()
            }, 0)
        })
    }

    private static setMessage(message: string | null, success?: boolean): void {
        const messageContainer = document.getElementById('image-recognition-message') as HTMLElement
        messageContainer.classList.remove('active', 'success', 'error')
        if (message) {
            messageContainer.classList.add('active')
            messageContainer.querySelector('.message')!.textContent = message
            const iconSuccess = messageContainer.querySelector('.icon-success') as HTMLLIElement
            const iconError = messageContainer.querySelector('.icon-error') as HTMLLIElement
            iconSuccess.hidden = true
            iconError.hidden = true
            if (success) {
                iconSuccess.hidden = false
                messageContainer.classList.add('success')
            } else {
                iconError.hidden = false
                messageContainer.classList.add('error')
            }
        }
    }

    static handleTranscriptionActions(type: 'write' | 'copy'): void {
        if (!this.transcriptionsData) return
        const transcription = this.transcriptionsData.transcription
        if (transcription && transcription.length > 0) {
            const resultActions = this.transcriptionResultEle.querySelector(
                '.actions',
            ) as HTMLElement
            if (type === 'write') {
                addNewContentToNoteEditor(`\n\n${transcription}`)
                const writeToNoteAction = resultActions.querySelector('.write') as HTMLElement
                LayoutController.transitionBackwards(
                    writeToNoteAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Wrote</span>`,
                )
            } else {
                copyToClipboard(transcription)
                const copyAction = resultActions.querySelector('.copy') as HTMLElement
                LayoutController.transitionBackwards(
                    copyAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Copied</span>`,
                )
            }
        } else {
            this.setMessage('No transcription found!')
        }
    }
}
