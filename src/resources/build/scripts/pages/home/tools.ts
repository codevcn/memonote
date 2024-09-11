type TTranscribeAudioPld = {
    chunk: File
    totalChunks: number
    uploadId: string
}

class TranscriptAudioController {
    // static async transcriptAudioHandler(target: HTMLInputElement): Promise<void> {
    //     const audioFile = target.files![0]
    //     normalEditorSocket.emitWithoutTimeout<TTranscribeAudioPld>(
    //         ENoteEvents.TRANSCRIBE_AUDIO,
    //         {
    //             chunk: audioFile,
    //             totalChunks: 1,
    //             uploadId: generateUploadId(),
    //         },
    //         (res) => {
    //             console.log('>>> res of transcribe audio >>>', res)
    //         },
    //     )
    // }

    static async transcriptAudioHandler(): Promise<void> {
        const form = document.getElementById('transcribe-audio-form') as HTMLFormElement
        const formData = new FormData(form)
        const audioFile = formData.get('audio-file') as File
        const lang = formData.get('audio-language') as TAudioLangs
        const formDataWithFile = new FormData()
        formDataWithFile.set('audioFile', audioFile)
        formDataWithFile.set('audioLang', lang)
        let transcription: string | null
        try {
            const { data } = await transcribeAudioAPI(formDataWithFile)
            console.log('>>> data of api >>>', data)
            transcription = data.transcription
        } catch (error) {
            console.log('>>> transcribe api error >>>', error)
            if (error instanceof Error) {
                const err = HTTPErrorHandler.handleError(error)
                LayoutController.toast('error', err.message)
            }
            return
        }
        if (transcription) {
        }
    }

    static setMessage(message: string | null): void {
        const messageEle = document.querySelector('#transcription-result .message') as HTMLElement
        messageEle.classList.remove('active')
        if (message) {
            messageEle.classList.add('active')
            messageEle.textContent = message
        }
    }
}

class ToolsDriver {}
