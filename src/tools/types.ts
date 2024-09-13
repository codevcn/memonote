export type TMulterFile = Express.Multer.File

export type TTranscribeAudioFile = Omit<TMulterFile, 'buffer'>

export type TTranscribeAudioRes = {
    transcription: string | null
}

export type TTranscribeAudioState = {
    state: 'transcribing'
    clientSocketId: string
}
