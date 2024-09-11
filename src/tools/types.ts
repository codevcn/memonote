export type TMulterFile = Express.Multer.File

export type TTranscribeAudioFile = Omit<TMulterFile, 'buffer'>

export type TTranscribeAudioRes = {
    transcription: string | null
}
