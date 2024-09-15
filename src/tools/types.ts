export type TMulterFile = Express.Multer.File

export type TTranscribeAudioFile = Omit<TMulterFile, 'buffer'>

export type TTranscribeStates = 'transcribing'

export type TTranscribeAudioState = {
    state: 'transcribing'
    clientSocketId: string
}

export type TTranscribeAudios = {
    audioId: string
    audioFilename: string
    transcription: string | null
}
