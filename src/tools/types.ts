export type TMulterFile = Express.Multer.File

export type TTranscribeAudioFile = Omit<TMulterFile, 'buffer'>

export type TTranscribeAudio = {
    transcription: string | null
    confidence: number
}
