type TTranscribeAudioPld = {
    chunk: File
    totalChunks: number
    uploadId: string
}

class TranscriptAudioController {
    private static setSubmitLoading(loading: boolean): void {
        const submitBtn = document.querySelector(
            '#transcribe-audio-form .submit-btn',
        ) as HTMLElement
        if (loading) {
            submitBtn.classList.add('loading')
            submitBtn.innerHTML = Materials.createHTMLLoading('border')
        } else {
            submitBtn.classList.remove('loading')
            submitBtn.innerHTML = `<span>Transcribe</span>`
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

    private static validateAudioFile(file: File): boolean {
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
        return true
    }

    static async transcriptAudioHandler(e: SubmitEvent): Promise<void> {
        e.preventDefault()
        const form = document.getElementById('transcribe-audio-form') as HTMLFormElement
        const formData = new FormData(form)
        const audioFile = formData.get('audio-file') as File
        const lang = formData.get('audio-language') as TAudioLangs
        if (this.validateAudioFile(audioFile)) {
            this.setSubmitLoading(true)
            const formDataWithFile = new FormData()
            formDataWithFile.set('audioFile', audioFile)
            formDataWithFile.set('audioLang', lang)
            formDataWithFile.set('socketId', normalEditorSocket.getSocketId())
            let transcription: string | null = null
            try {
                const { data } = await transcribeAudioAPI(formDataWithFile)
                console.log('>>> data of api >>>', data)
                transcription = data.transcription
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
            if (transcription) {
                this.setTranscriptionResult(transcription)
            }
            this.setSubmitLoading(false)
        }
    }

    private static setMessage(message: string | null): void {
        const messageEle = document.getElementById('transcribe-audio-message') as HTMLElement
        messageEle.classList.remove('active')
        if (message) {
            messageEle.classList.add('active')
            messageEle.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>${message}</span>`
        }
    }

    private static setTranscriptionResult(transcription: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = document.querySelector(
                    '#transcription-result .text-box',
                ) as HTMLElement
                textBox.textContent = transcription
                resolve(true)
            }, 0)
        })
    }

    private static setUIForPickedFile(): void {}
}

class ToolsDriver {}
