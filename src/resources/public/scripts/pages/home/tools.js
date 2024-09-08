'use strict'
class TranscriptAudioController {
    static async transcriptAudioHandler(target) {
        const audioFile = target.files[0]
        normalEditorSocket.emitWithoutTimeout(
            ENoteEvents.TRANSCRIBE_AUDIO,
            {
                chunk: audioFile,
                totalChunks: 1,
                uploadId: generateUploadId(),
            },
            (res) => {
                console.log('>>> res of transcribe audio >>>', res)
            },
        )
    }
}
