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

class TranscribeAudioController {
    private static transcriptionsData: TTranscribeAudioData[] = []
    private static focusedTranscriptionIndex: number = -1
    private static pickedAudioFiles: TPickedAudioFile[] = []

    private static transcribedFilesEle = document.querySelector(
        '#transcription-result .transcribed-files',
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

    private static validateAudioFile(): boolean {
        const files = this.pickedAudioFiles.map((file) => file.audioFile)
        for (const file of files) {
            const fileSize = file.size
            if (!file || fileSize === 0) {
                this.setMessage('Please pick a file!')
                return false
            }
            const maxFileSize = EAudioFiles.MAX_FILE_SIZE
            if (fileSize > maxFileSize) {
                this.setMessage(`Audio file must be from ${maxFileSize} lower.`)
                return false
            }
            const maxFilenameSize = EAudioFiles.MAX_FILENAME_SIZE
            if (countBytesOfString(file.name) > maxFilenameSize) {
                this.setMessage(`Audio filename must be from ${maxFilenameSize} lower.`)
                return false
            }
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

    static async transcribeAudioHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const form = document.getElementById('transcribe-audio-form') as HTMLFormElement
        const formData = new FormData(form)
        const lang = formData.get('audio-language') as TAudioLangs
        if (this.validateAudioFile()) {
            this.setMessage(null)
            this.setSubmitLoading(true)
            this.resetDataAndUI()

            const audios = this.pickedAudioFiles
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
                const textBox = document.querySelector(
                    '#transcription-result .text-box',
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

    static pickFiles(target: HTMLInputElement): void {
        const files = target.files
        if (files && files.length > 0) {
            const audios = Array.from(files).map<TPickedAudioFile>((file) => ({
                audioId: `audio-id-${generateUploadId()}`,
                audioFile: file,
            }))
            this.pickedAudioFiles = audios
            this.setUIForPickedFiles(audios)
        }
    }

    private static setUIForPickedFiles(files: TPickedAudioFile[]): void {
        const uploadFile = document.querySelector(
            '#transcribe-audio-form .upload-box .upload-file',
        ) as HTMLElement
        uploadFile.classList.remove('active')
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
            const resultActions = document.querySelector(
                '#transcription-result .actions',
            ) as HTMLElement
            if (type === 'write') {
                addNewContentToNoteEditor(`\n${transcription}`)
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
    private static transcription: string | null = null
}
