type TTranscribeAudioPld = {
    chunk: File
    totalChunks: number
    uploadId: string
}

class TranscriptAudioController {
    static async transcriptAudioHandler(target: HTMLInputElement): Promise<void> {
        const audioFile = target.files![0]
        normalEditorSocket.emitWithoutTimeout<TTranscribeAudioPld>(
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
