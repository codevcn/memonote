'use strict'
var _a
class TranscribeAudioController {
    static setTranscriptionsData(transcriptions) {
        this.transcriptionsData = transcriptions
    }
    static addTranscriptionsData(...transcription) {
        this.transcriptionsData.push(...transcription)
    }
    static setSubmitLoading(loading) {
        const submitBtn = document.querySelector('#transcribe-audio-form .submit-btn')
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
    static setTranscribeAudioStatus(audioId, status) {
        const pickedFile = document.querySelector(
            `#transcribe-audio-form .upload-box .picked-audio-files .files-list .file-item[data-audio-id="${audioId}"]`,
        )
        pickedFile.classList.remove('loading', 'success', 'error', 'info')
        pickedFile.classList.add(status)
    }
    static validatePickedAudios(files) {
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
    static validateBeforeSubmit(audios) {
        if (!audios || audios.length === 0) {
            this.setMessage('Please pick a file!')
            return false
        }
        return true
    }
    static createFormData(audioFile, lang) {
        const formData = new FormData()
        formData.set('audioFile', audioFile)
        formData.set('audioLang', lang)
        formData.set('clientSocketId', normalEditorSocket.getSocketId())
        return formData
    }
    static async transcribeAudiosHandler(e) {
        e.preventDefault()
        const audios = this.pickedAudioFiles
        if (!this.validateBeforeSubmit(audios)) return
        const form = document.getElementById('transcribe-audio-form')
        const formData = new FormData(form)
        const lang = formData.get('audio-language')
        this.setMessage(null)
        this.setSubmitLoading(true)
        this.resetDataAndUI()
        let transcribedCount = 0
        for (const audio of audios) {
            const audioId = audio.audioId
            this.setTranscribeAudioStatus(audioId, 'loading')
            transcribeAudioAPI(this.createFormData(audio.audioFile, lang))
                .then(({ data }) => {
                    const { transcription } = data
                    if (transcription && transcription.length > 0) {
                        this.setTranscribeAudioStatus(audioId, 'success')
                        const transcriptionData = {
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
    static setMessage(message, success) {
        const messageContainer = document.getElementById('transcribe-audio-message')
        messageContainer.classList.remove('active', 'success', 'error')
        if (message) {
            messageContainer.classList.add('active')
            messageContainer.querySelector('.message').textContent = message
            const iconSuccess = messageContainer.querySelector('.icon-success')
            const iconError = messageContainer.querySelector('.icon-error')
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
    static setTranscription(transcription, index) {
        this.focusedTranscriptionIndex = index
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = this.transcriptionResultEle.querySelector('.text-box')
                textBox.textContent = transcription || ''
                resolve()
            }, 0)
        })
    }
    static resetDataAndUI() {
        this.setTranscriptionsData([])
        this.transcribedFilesEle.innerHTML = ''
        this.setTranscription(null, 0)
    }
    static addTranscriptions(transcription) {
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
    static pickAudios(target) {
        const filesList = target.files
        if (filesList && filesList.length > 0) {
            const files = Array.from(filesList)
            if (this.validatePickedAudios(files)) {
                const audios = files.map((file) => ({
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
    static setUIForPickedFiles(files) {
        document
            .querySelector('#transcribe-audio-form .upload-box .upload-file')
            .classList.remove('active')
        const pickedFiles = document.querySelector(
            '#transcribe-audio-form .upload-box .picked-audio-files',
        )
        pickedFiles.classList.add('active')
        const filesList = pickedFiles.querySelector('.files-list')
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
    static handleTranscriptionActions(type) {
        const focusedTranscriptionIndex = this.focusedTranscriptionIndex
        if (focusedTranscriptionIndex < 0) return
        const transcription = this.transcriptionsData[focusedTranscriptionIndex].transcription
        if (transcription && transcription.length > 0) {
            const resultActions = this.transcriptionResultEle.querySelector('.actions')
            if (type === 'write') {
                addNewContentToNoteEditor(`\n\n${transcription}`)
                const writeToNoteAction = resultActions.querySelector('.write')
                LayoutController.transitionBackwards(
                    writeToNoteAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Wrote</span>`,
                )
            } else {
                copyToClipboard(transcription)
                const copyAction = resultActions.querySelector('.copy')
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
    static switchTranscriptions() {
        const transcriptions = this.transcriptionsData
        if (transcriptions && transcriptions.length > 0) {
            const transcribedFilesEle = this.transcribedFilesEle
            const audioId = transcribedFilesEle.value
            const index = transcriptions.findIndex(
                (transcription) => transcription.audioId === audioId,
            )
            this.setTranscription(transcriptions[index].transcription, index)
        }
    }
}
_a = TranscribeAudioController
TranscribeAudioController.transcriptionsData = []
TranscribeAudioController.focusedTranscriptionIndex = -1
TranscribeAudioController.pickedAudioFiles = []
TranscribeAudioController.transcriptionResultEle = document.querySelector(
    '#transcribe-audio-container .transcription-result',
)
TranscribeAudioController.transcribedFilesEle =
    _a.transcriptionResultEle.querySelector('.transcribed-files')
class ImageRecognitionController {
    static async createWorker(imageLangs, logger, errorHandler) {
        var _b
        const workers = this.workers
        let worker =
            workers.length > 0
                ? (_b = workers.find(({ langs }) =>
                      langs.every((lang) => imageLangs.includes(lang)),
                  )) === null || _b === void 0
                    ? void 0
                    : _b.worker
                : null
        if (!worker) {
            worker = await Tesseract.createWorker(imageLangs, 1, {
                errorHandler,
                logger: (m) => {
                    logger(m.status, m.progress)
                },
            })
            this.workers.push({ langs: imageLangs, worker })
        }
        return worker
    }
    static async pickImages(target) {
        const filesList = target.files
        if (filesList && filesList.length > 0) {
            const uploadBox = document.querySelector('#image-recognition-container .upload-box')
            const beforeHTML = uploadBox.innerHTML
            uploadBox.innerHTML = Materials.createHTMLLoading('border')
            const files = Array.from(filesList)
            let isValid = false
            try {
                await this.validateImages(files)
                isValid = true
            } catch (error) {
                this.setMessage(error.message, false)
            }
            uploadBox.innerHTML = beforeHTML
            if (isValid) {
                const images = files.map((file) => ({
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
    static isValidImgType(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.addEventListener('load', (e) => {
                const fileAsArrayBuffer = e.target.result
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
    static async validateImages(files) {
        if (files.length > this.maxImgsCount) {
            throw new BaseCustomError('Maximum number of images is ' + this.maxImgsCount)
        }
        await Promise.all(files.map((file) => ImageRecognitionController.isValidImgType(file)))
    }
    static setUIForPickedFiles(images) {
        document
            .querySelector('#image-recognition-form .upload-box .upload-file')
            .classList.remove('active')
        document
            .querySelector('#image-recognition-form .upload-box .picked-image-files')
            .classList.add('active')
        const slideImgs = document.querySelector('#images-preview-slider .slide-images')
        slideImgs.innerHTML = ''
        const carouselIndicators = document.querySelector(
            '#images-preview-slider .carousel-indicators',
        )
        carouselIndicators.innerHTML = ''
        let i = 0
        for (const image of images) {
            const imageName = image.imageFile.name
            const carouselItem = document.createElement('div')
            carouselItem.className = 'carousel-item'
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
            slideImgs.appendChild(carouselItem)
            carouselIndicators.innerHTML += `
                <button type="button" data-bs-target="#images-preview-slider" data-bs-slide-to="${i}" class="active"></button>`
            i++
        }
        slideImgs.querySelector('.carousel-item').classList.add('active')
        carouselIndicators.querySelector('button').classList.add('active')
    }
    static async recognitionSingleImage(image, langs) {
        const worker = await this.createWorker(
            langs,
            (status, progress) => {},
            (error) => {},
        )
        const result = await worker.recognize(image)
        console.log('>>> trans >>>', result.data.text)
        await worker.terminate()
        return result.data.text
    }
    // private static async recognitionImages(images: File[], lang: TImageLangs): Promise<string> {}
    static async recognizeImagesHandler(e) {
        e.preventDefault()
        const pickedImageFiles = this.pickedImageFiles.map(({ imageFile }) => imageFile)
        const formData = new FormData(document.getElementById('image-recognition-form'))
        const imageLangs = formData.getAll('image-lang')
        console.log('>>> this picked images >>>', this.pickedImageFiles)
        if (pickedImageFiles.length > 1) {
            // const transcription = await this.recognitionImages(pickedImageFiles, imagesLang)
            // this.setTranscription(transcription, 0)
        } else {
            const transcription = await this.recognitionSingleImage(pickedImageFiles[0], imageLangs)
            this.setTranscription(transcription, 0)
        }
    }
    static setTranscription(transcription, index) {
        this.focusedTranscriptionIndex = index
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = this.transcriptionResultEle.querySelector('.text-box')
                textBox.textContent = transcription || ''
                resolve()
            }, 0)
        })
    }
    static setMessage(message, success) {
        const messageContainer = document.getElementById('image-recognition-message')
        messageContainer.classList.remove('active', 'success', 'error')
        if (message) {
            messageContainer.classList.add('active')
            messageContainer.querySelector('.message').textContent = message
            const iconSuccess = messageContainer.querySelector('.icon-success')
            const iconError = messageContainer.querySelector('.icon-error')
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
    static handleTranscriptionActions(type) {
        const focusedTranscriptionIndex = this.focusedTranscriptionIndex
        if (focusedTranscriptionIndex < 0) return
        const transcription = this.transcriptionsData[focusedTranscriptionIndex].transcription
        if (transcription && transcription.length > 0) {
            const resultActions = this.transcriptionResultEle.querySelector('.actions')
            if (type === 'write') {
                addNewContentToNoteEditor(`\n\n${transcription}`)
                const writeToNoteAction = resultActions.querySelector('.write')
                LayoutController.transitionBackwards(
                    writeToNoteAction,
                    `<i class="bi bi-check-all"></i>
                    <span>Wrote</span>`,
                )
            } else {
                copyToClipboard(transcription)
                const copyAction = resultActions.querySelector('.copy')
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
ImageRecognitionController.transcriptionsData = []
ImageRecognitionController.focusedTranscriptionIndex = -1
ImageRecognitionController.pickedImageFiles = []
ImageRecognitionController.imageAllowedExts = [
    { exts: ['jpg', 'jpeg'], magicNumber: 'ffd8ffe0' },
    { exts: ['png'], magicNumber: '89504e47' },
    { exts: ['webp'], magicNumber: '52494646' },
]
ImageRecognitionController.transcriptionResultEle = document.querySelector(
    '#image-recognition-container .transcription-result',
)
ImageRecognitionController.workers = []
ImageRecognitionController.scheduler = null
ImageRecognitionController.maxImgsCount = 5
