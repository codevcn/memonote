export type TMulterFile = Express.Multer.File

export type TTranscribeAudioFile = Omit<TMulterFile, 'buffer'>

export type TParagraphs = {
    wordsCount: number
    sentences: string[]
}

export type TTranscribeAudio = {
    transcription: string | null
    confidence: number
    paragraphs: TParagraphs[] | null
}
