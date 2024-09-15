type TTranscribeAudioPld = {
    chunk: File
    totalChunks: number
    uploadId: string
}

class TranscribeAudioController {
    private static transcriptionsData: TTranscribeAudiosResAPI[]

    static setTranscriptionsData(transcriptions: TTranscribeAudiosResAPI[]): void {
        this.transcriptionsData = transcriptions
    }

    static addTranscriptionsData(...transcription: TTranscribeAudiosResAPI[]): void {
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

    static setTranscribeLoading(loading: boolean): void {
        const textBox = document.querySelector('#transcription-result .text-box') as HTMLElement
        if (loading) {
            textBox.classList.add('loading')
            textBox.innerHTML = Materials.createHTMLLoading('border')
        } else {
            textBox.classList.remove('loading')
            textBox.innerHTML = 'Your transcription would be here...'
        }
    }

    private static validateAudioFile(files: File[]): boolean {
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

    private static createFormData(audioFiles: File[], lang: TAudioLangs): FormData {
        const formData = new FormData()
        for (const audioFile of audioFiles) {
            formData.append('audioFiles', audioFile)
        }
        formData.set('audioLang', lang)
        formData.set('clientSocketId', normalEditorSocket.getSocketId())
        return formData
    }

    static async transcriptAudioHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const form = document.getElementById('transcribe-audio-form') as HTMLFormElement
        const formData = new FormData(form)
        const audioFiles = formData.getAll('audio-files') as File[]
        const lang = formData.get('audio-language') as TAudioLangs
        if (this.validateAudioFile(audioFiles)) {
            this.setMessage(null)
            this.setSubmitLoading(true)
            const formDataWithFile = this.createFormData(audioFiles, lang)
            this.setTranscriptionsData([])
            try {
                await transcribeAudiosAPI(formDataWithFile, (data) => {
                    console.log('>>> data of api >>>', data)
                    this.addTranscriptionsData(data)
                })
            } catch (error) {
                console.log('>>> transcribe api error >>>', error)
                if (error instanceof Error) {
                    const err = HTTPErrorHandler.handleError(error)
                    const errMessage = err.message
                    LayoutController.toast('error', errMessage)
                    this.setMessage(errMessage)
                }
            }
            this.setTranscribeLoading(false)
            const transcriptions = this.transcriptionsData
            if (transcriptions && transcriptions.length > 0) {
                this.setTranscriptionsResult(transcriptions)
                this.setMessage('Transcribed!', true)
            }
            this.setSubmitLoading(false)
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

    private static setTranscription(transcription: string | null): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = document.querySelector(
                    '#transcription-result .text-box',
                ) as HTMLElement
                textBox.textContent = transcription || 'Transcription is empty...'
                resolve(true)
            }, 0)
        })
    }

    private static setTranscriptionsResult(transcriptions: TTranscribeAudiosResAPI[]): void {
        const transcribedFiles = document.querySelector(
            '#transcription-result .transcribed-files',
        ) as HTMLElement

        let transcriptionText: string | null = null
        for (const transcription of transcriptions) {
            const option = document.createElement('option')
            option.value = transcription.audioId
            option.textContent = transcription.audioFilename

            transcribedFiles.appendChild(option)

            const transcriptionData = transcription.transcription
            if (transcriptionText === null && transcriptionData && transcriptionData.length > 0) {
                transcriptionText = transcriptionData
                option.selected = true
            }
        }

        this.setTranscription(transcriptionText)
    }

    static pickFiles(target: HTMLInputElement): void {
        const files = target.files
        if (files && files.length > 0) {
            this.setUIForPickedFiles(files)
        }
    }

    private static setUIForPickedFiles(files: FileList): void {
        const uploadFile = document.querySelector(
            '#transcribe-audio-form .upload-box .upload-file',
        ) as HTMLElement
        uploadFile.classList.remove('active')
        const pickedFile = document.querySelector(
            '#transcribe-audio-form .upload-box .picked-audio-files',
        ) as HTMLElement
        pickedFile.classList.add('active')
        const filesList = pickedFile.querySelector('.files-list') as HTMLElement
        filesList.innerHTML = ''
        for (const file of files) {
            const filename = file.name
            const fileEle = document.createElement('div')
            fileEle.className = 'file-item'
            fileEle.innerHTML = `
                <i class="bi bi-file-earmark-music"></i>
                ${filename}`
            fileEle.title = filename

            filesList.appendChild(fileEle)
        }
    }

    static handleTranscriptionActions(type: 'write' | 'copy'): void {
        const transcriptions = this.transcriptionsData
        // if (transcription && transcription.length > 0) {
        //     const resultActions = document.querySelector(
        //         '#transcription-result .actions',
        //     ) as HTMLElement
        //     if (type === 'write') {
        //         addNewContentToNoteEditor(`\n${transcription}`)
        //         const writeToNoteAction = resultActions.querySelector('.write') as HTMLElement
        //         LayoutController.transitionBackwards(
        //             writeToNoteAction,
        //             `<i class="bi bi-check-all"></i>
        //             <span>Wrote</span>`,
        //         )
        //     } else {
        //         copyToClipboard(transcription)
        //         const copyAction = resultActions.querySelector('.copy') as HTMLElement
        //         LayoutController.transitionBackwards(
        //             copyAction,
        //             `<i class="bi bi-check-all"></i>
        //             <span>Copied</span>`,
        //         )
        //     }
        // } else {
        //     this.setMessage('No transcription found!')
        // }
    }

    static switchTranscriptions(): void {
        const transcriptions = this.transcriptionsData
        if (transcriptions && transcriptions.length > 0) {
            const transcribedFilesEle = document.querySelector(
                '#transcription-result .transcribed-files',
            ) as HTMLSelectElement
            const audioId = transcribedFilesEle.value
            const { transcription } = transcriptions.find(
                (transcription) => transcription.audioId === audioId,
            )!
            this.setTranscription(transcription)
        }
    }
}

class ImageRecognitionController {
    private static transcription: string | null = null
}
