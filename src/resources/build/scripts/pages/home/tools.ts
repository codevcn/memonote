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
    worker: TUnknownObject
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
    private static transcriptionsData: TRecognitionImageData[] = []
    private static focusedTranscriptionIndex: number = -1
    private static pickedImageFiles: TPickedImageFile[] = []
    private static readonly imageAllowedExts: TImageAllowedExt[] = [
        { exts: ['jpg', 'jpeg'], magicNumber: 'ffd8ffe0' },
        { exts: ['png'], magicNumber: '89504e47' },
        { exts: ['webp'], magicNumber: '52494646' },
    ]
    private static readonly transcriptionResultEle = document.querySelector(
        '#image-recognition-container .transcription-result',
    ) as HTMLElement
    private static workers: TRecognitionWorker[] = []
    private static scheduler: TUnknownObject | null = null
    private static readonly maxImgsCount: number = 5

    static setTranscriptionsData(transcriptions: TRecognitionImageData[]): void {
        this.transcriptionsData = transcriptions
    }

    static addTranscriptionsData(...transcription: TRecognitionImageData[]): void {
        this.transcriptionsData.push(...transcription)
    }

    private static async createWorker(
        imageLangs: TImageLangs[],
        logger: (status: string, progress: string) => void,
        errorHandler: (error: any) => void,
    ): Promise<TUnknownObject> {
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
                const images = files.map<TPickedImageFile>((file) => ({
                    imageFile: file,
                    imgURL: URL.createObjectURL(file),
                }))
                this.pickedImageFiles = images
                this.setUIForPickedFiles(images)
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

    private static setUIForPickedFiles(images: TPickedImageFile[]) {
        document
            .querySelector('#image-recognition-form .upload-box .upload-file')!
            .classList.remove('active')
        document
            .querySelector('#image-recognition-form .upload-box .picked-image-files')!
            .classList.add('active')
        const slideImgs = document.querySelector(
            '#images-preview-slider .slide-images',
        ) as HTMLElement
        slideImgs.innerHTML = ''
        const carouselIndicators = document.querySelector(
            '#images-preview-slider .carousel-indicators',
        ) as HTMLElement
        carouselIndicators.innerHTML = ''
        let i: number = 0
        for (const image of images) {
            const imageName = image.imageFile.name
            const carouselItem = document.createElement('div')
            carouselItem.className = `carousel-item carousel-index-${i}`
            const slideTitle = document.createElement('h2')
            slideTitle.className = 'slide-title'
            slideTitle.title = `Image: ${imageName}`
            slideTitle.innerHTML = `
                <i class="bi bi-file-earmark-image"></i>
                <span>${imageName}</span>`
            const slideImg = document.createElement('img')
            slideImg.src = image.imgURL
            slideImg.alt = `Picked Image - ${imageName}`
            carouselItem.appendChild(slideTitle)
            carouselItem.appendChild(slideImg)
            carouselItem.insertAdjacentHTML(
                'beforeend',
                Materials.createHTMLProgress('success', 0, 'recognition-progress'),
            )
            slideImgs.appendChild(carouselItem)
            carouselIndicators.innerHTML += `
                <button type="button" data-bs-target="#images-preview-slider" data-bs-slide-to="${i}" class="active"></button>`
            i++
        }
        slideImgs.querySelector('.carousel-item')!.classList.add('active')
        carouselIndicators.querySelector('button')!.classList.add('active')
    }

    private static async recognitionSingleImage(
        image: File,
        langs: TImageLangs[],
        successHandler: (transcription: string) => Promise<void>,
    ): Promise<void> {
        const worker = await this.createWorker(
            langs,
            (status, progress) => {
                if (status === 'recognizing text') {
                    this.setRecognitionProgress(0, Number((Number(progress) * 100).toFixed(2)))
                }
            },
            (error) => {},
        )
        const transcription = (await worker.recognize(image)).data.text
        await successHandler(transcription)
    }

    private static setRecognitionProgress(imgIndex: number, percent: number): void {
        const progress = document.querySelector(
            `#image-recognition-form .carousel-index-${imgIndex} .recognition-progress`,
        ) as HTMLElement
        progress.classList.add('active')
        const progressBar = progress.querySelector('.progress-bar') as HTMLElement
        progressBar.style.width = `${percent}%`
        progressBar.textContent = `${percent}%`
        if (percent === 100) {
            progressBar.classList.remove('progress-bar-animated')
        }
    }

    private static async recognitionImages(
        images: File[],
        langs: TImageLangs[],
        successHandler: (transcription: string) => Promise<void>,
    ): Promise<void> {
        if (!this.scheduler) {
            this.scheduler = Tesseract.createScheduler()
        }
        await Promise.all(
            Array(Math.floor(images.length / 2))
                .fill(0)
                .map(() => {
                    return (async () => {
                        this.scheduler!.addWorker(
                            await this.createWorker(
                                langs,
                                () => {},
                                () => {},
                            ),
                        )
                    })()
                }),
        )
        await new Promise<boolean>((resolve, reject) => {
            console.log('>>> add job schedule >>>', this.scheduler!.addJob)
            let count: number = 0
            for (const img of images) {
                this.scheduler!.addJob('recognize', img)
                    .then((res: any) => {
                        successHandler(res.data.text)
                    })
                    .catch((error: any) => {})
                    .finally(() => {
                        count++
                        if (count === images.length) {
                            this.scheduler!.terminate()
                                .then(() => {
                                    resolve(true)
                                })
                                .catch((error: any) => {
                                    reject(new BaseCustomError(error.message))
                                })
                        }
                    })
            }
        })
    }

    static async recognizeImagesHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const pickedImageFiles = this.pickedImageFiles.map(({ imageFile }) => imageFile)
        const formData = new FormData(
            document.getElementById('image-recognition-form') as HTMLFormElement,
        )
        const imageLangs = formData.getAll('image-lang') as TImageLangs[]
        const submitBtn = document.querySelector(
            '#image-recognition-form .submit-btn',
        ) as HTMLElement
        submitBtn.innerHTML = Materials.createHTMLLoading('border')
        if (pickedImageFiles.length > 1) {
            this.setTranscriptionsData([])
            let transcriptionDataIndex: number = -1
            try {
                await this.recognitionImages(
                    pickedImageFiles,
                    imageLangs,
                    async (transcription) => {
                        transcriptionDataIndex++
                        this.addTranscriptionsData({ transcription })
                        if (transcriptionDataIndex === 0) {
                            this.setTranscription(transcription, transcriptionDataIndex)
                        }
                    },
                )
            } catch (error) {
                this.setMessage('Fail to recognize the images')
            }
        } else {
            try {
                await this.recognitionSingleImage(
                    pickedImageFiles[0],
                    imageLangs,
                    async (transcription) => {
                        this.setTranscriptionsData([{ transcription }])
                        this.setTranscription(transcription, 0)
                    },
                )
            } catch (error) {
                this.setMessage('Fail to recognize the image')
            }
        }
        submitBtn.innerHTML = 'Recognize'
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
}
