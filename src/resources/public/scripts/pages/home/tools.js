'use strict'
class TranscriptAudioController {
    static setSubmitLoading(loading) {
        const submitBtn = document.querySelector('#transcribe-audio-form .submit-btn')
        if (loading) {
            submitBtn.classList.add('loading')
            submitBtn.innerHTML = Materials.createHTMLLoading('border')
        } else {
            submitBtn.classList.remove('loading')
            submitBtn.innerHTML = `<span>Transcribe</span>`
        }
    }
    static setTranscribeLoading(loading) {
        const textBox = document.querySelector('#transcription-result .text-box')
        if (loading) {
            textBox.classList.add('loading')
            textBox.innerHTML = Materials.createHTMLLoading('border')
        } else {
            textBox.classList.remove('loading')
            textBox.innerHTML = 'Your transcription would be here...'
        }
    }
    static validateAudioFile(file) {
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
    static async transcriptAudioHandler(e) {
        e.preventDefault()
        const form = document.getElementById('transcribe-audio-form')
        const formData = new FormData(form)
        const audioFile = formData.get('audio-file')
        const lang = formData.get('audio-language')
        if (this.validateAudioFile(audioFile)) {
            this.setSubmitLoading(true)
            const formDataWithFile = new FormData()
            formDataWithFile.set('audioFile', audioFile)
            formDataWithFile.set('audioLang', lang)
            formDataWithFile.set('socketId', normalEditorSocket.getSocketId())
            let transcription = null
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
    static setMessage(message) {
        const messageEle = document.getElementById('transcribe-audio-message')
        messageEle.classList.remove('active')
        if (message) {
            messageEle.classList.add('active')
            messageEle.innerHTML = `
                <i class="bi bi-exclamation-triangle-fill"></i>
                <span>${message}</span>`
        }
    }
    static setTranscriptionResult(transcription) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = document.querySelector('#transcription-result .text-box')
                textBox.textContent = transcription
                resolve(true)
            }, 0)
        })
    }
    static setUIForPickedFile() {}
}
class ToolsDriver {}
