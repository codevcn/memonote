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
        const submitBtn = this.form.querySelector('.submit-btn')
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
        const pickedFile = this.form.querySelector(
            `.upload-box .picked-audio-files .files-list .file-item[data-audio-id="${audioId}"]`,
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
        const formData = new FormData(this.form)
        const lang = formData.get('audios-language')
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
                        this.setMessage('Transcribed!', true)
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
        this.form.querySelector('.upload-box .upload-file').classList.remove('active')
        const pickedFiles = this.form.querySelector('.upload-box .picked-audio-files')
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
TranscribeAudioController.form = document.getElementById('transcribe-audio-form')
class ImageRecognitionController {
    static setTranscriptionsData(transcription) {
        this.transcriptionsData = transcription
    }
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
        await Promise.all(files.map((file) => ImageRecognitionController.isValidImgType(file)))
    }
    static setUIForPickedFile(image) {
        const imgName = image.imageFile.name
        this.form
            .querySelector('.upload-box')
            .classList.replace('active-upload-file', 'active-picked-image-file')
        const pickedImageEle = this.form.querySelector('.upload-box .picked-image-file')
        pickedImageEle.classList.replace(`active-${this.stageId}`, 'active-pre-recognition-img')
        const imgTitle = pickedImageEle.querySelector('.image-title .text')
        imgTitle.textContent = imgName
        imgTitle.title = imgName
        pickedImageEle.querySelector('.progress').outerHTML = Materials.createHTMLProgress(
            'success',
            0,
            'w-100 mt-3',
        )
        this.setSwitcRecognitionhButton(false)
        document.getElementById('pre-recognition-img').innerHTML =
            `<img src="${image.imgURL}" alt="${imgName}" />`
    }
    static async recognitionSingleImage(image, langs) {
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
    static setRecognitionProgress(percent) {
        const progress = this.form.querySelector(`.picked-image-file .progress`)
        progress.classList.add('active')
        const progressBar = progress.querySelector('.progress-bar')
        progressBar.style.width = `${percent}%`
        progressBar.textContent = `${percent}%`
        if (percent === 100) {
            progressBar.classList.remove('progress-bar-animated')
        }
    }
    static selectWordOnRecognitionRect(word, selectedRect) {
        const rects = this.layer.find('Rect')
        for (const rect of rects) {
            rect.stroke('red')
            rect.strokeWidth(2)
        }
        selectedRect.stroke('blue')
        selectedRect.strokeWidth(3)
        this.layer.draw()
        const mousePos = this.stage.getPointerPosition()
        const recognitionPopover = document.getElementById('recognition-result-popover')
        this.showPopoverOnSelectWord(false, recognitionPopover)
        recognitionPopover.style.left = `${mousePos.x}px`
        recognitionPopover.style.top = `${mousePos.y}px`
        recognitionPopover.querySelector('.text').textContent = word
    }
    static showPopoverOnSelectWord(hidden, popover) {
        if (popover) {
            popover.hidden = hidden
        } else {
            document.getElementById('recognition-result-popover').hidden = hidden
        }
    }
    static setupRecognitionResult(recognitionResult, imageURL, stageWidth, stageHeight) {
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
                    let index = 0
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
    static async visualizeRecognitionResult(recognitionResult, imageURL) {
        const imgPreview = document.querySelector('#pre-recognition-img img')
        const stageWidth = imgPreview.clientWidth
        const stageHeight = imgPreview.clientHeight
        this.switchRecognition(`active-${this.stageId}`)
        await this.setupRecognitionResult(recognitionResult, imageURL, stageWidth, stageHeight)
    }
    static setSwitcRecognitionhButton(active) {
        const switchBtn = this.form.querySelector('.header .form-switch')
        switchBtn.classList.remove('active')
        if (active) {
            switchBtn.classList.add('active')
        }
    }
    static validateBeforeRecognize(pickedImage) {
        if (!pickedImage) {
            this.setMessage('Please pick a file!')
            return false
        }
        return true
    }
    static async recognizeImageHandler(e) {
        e.preventDefault()
        const pickedImage = this.pickedImageFile
        if (!this.validateBeforeRecognize(pickedImage)) return
        const formData = new FormData(this.form)
        const imageLangs = formData.getAll('image-lang')
        const submitBtn = this.form.querySelector('.submit-btn')
        submitBtn.innerHTML = Materials.createHTMLLoading('border')
        submitBtn.classList.add('loading')
        let result = null
        try {
            result = await this.recognitionSingleImage(pickedImage.imageFile, imageLangs)
        } catch (error) {
            this.setMessage('Fail to recognize the image')
        }
        if (result) {
            const transcription = result.data.text
            this.setSwitcRecognitionhButton(true)
            this.visualizeRecognitionResult(result, pickedImage.imgURL).then(() => {
                this.setTranscriptionsData({ transcription })
                this.setTranscription(transcription)
            })
        }
        submitBtn.innerHTML = 'Recognize'
        submitBtn.classList.remove('loading')
    }
    static switchRecognition(switchTo) {
        const pickedImgFile = this.form.querySelector('.picked-image-file')
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
    static setTranscription(transcription) {
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
        if (!this.transcriptionsData) return
        const transcription = this.transcriptionsData.transcription
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
ImageRecognitionController.transcriptionsData = null
ImageRecognitionController.pickedImageFile = null
ImageRecognitionController.imageAllowedExts = [
    { exts: ['jpg', 'jpeg'], magicNumber: 'ffd8ffe0' },
    { exts: ['png'], magicNumber: '89504e47' },
    { exts: ['webp'], magicNumber: '52494646' },
]
ImageRecognitionController.transcriptionResultEle = document.querySelector(
    '#image-recognition-container .transcription-result',
)
ImageRecognitionController.form = document.getElementById('image-recognition-form')
ImageRecognitionController.workers = []
ImageRecognitionController.stage = null
ImageRecognitionController.layer = null
ImageRecognitionController.stageId = 'recognition-result-preview'
