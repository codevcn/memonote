'use strict'
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
    static validateAudioFile(files) {
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
    static createFormData(audioFiles, lang) {
        const formData = new FormData()
        for (const audioFile of audioFiles) {
            formData.append('audioFiles', audioFile)
        }
        formData.set('audioLang', lang)
        formData.set('clientSocketId', normalEditorSocket.getSocketId())
        return formData
    }
    static async transcriptAudioHandler(e) {
        e.preventDefault()
        const form = document.getElementById('transcribe-audio-form')
        const formData = new FormData(form)
        const audioFiles = formData.getAll('audio-files')
        const lang = formData.get('audio-language')
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
    static setTranscription(transcription) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const textBox = document.querySelector('#transcription-result .text-box')
                textBox.textContent = transcription || 'Transcription is empty...'
                resolve(true)
            }, 0)
        })
    }
    static setTranscriptionsResult(transcriptions) {
        const transcribedFiles = document.querySelector('#transcription-result .transcribed-files')
        let transcriptionText = null
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
    static pickFiles(target) {
        const files = target.files
        if (files && files.length > 0) {
            this.setUIForPickedFiles(files)
        }
    }
    static setUIForPickedFiles(files) {
        const uploadFile = document.querySelector('#transcribe-audio-form .upload-box .upload-file')
        uploadFile.classList.remove('active')
        const pickedFile = document.querySelector(
            '#transcribe-audio-form .upload-box .picked-audio-files',
        )
        pickedFile.classList.add('active')
        const filesList = pickedFile.querySelector('.files-list')
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
    static handleTranscriptionActions(type) {
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
    static switchTranscriptions() {
        const transcriptions = this.transcriptionsData
        if (transcriptions && transcriptions.length > 0) {
            const transcribedFilesEle = document.querySelector(
                '#transcription-result .transcribed-files',
            )
            const audioId = transcribedFilesEle.value
            const { transcription } = transcriptions.find(
                (transcription) => transcription.audioId === audioId,
            )
            this.setTranscription(transcription)
        }
    }
}
class ImageRecognitionController {}
ImageRecognitionController.transcription = null
