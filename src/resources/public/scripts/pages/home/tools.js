'use strict'
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
    static async transcriptAudioHandler() {
        const form = document.getElementById('transcribe-audio-form')
        const formData = new FormData(form)
        const audioFile = formData.get('audio-file')
        const lang = formData.get('audio-language')
        const formDataWithFile = new FormData()
        formDataWithFile.set('audioFile', audioFile)
        formDataWithFile.set('audioLang', lang)
        try {
            const { data } = await transcribeAudioAPI(formDataWithFile)
            console.log('>>> data of api >>>', data)
        } catch (error) {
            console.log('>>> transcribe api error >>>', error)
        }
    }
}
class ToolsDriver {}
