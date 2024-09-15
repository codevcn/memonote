type TGetNotificationsResAPI = {
    notifs: TNotifData[]
    isEnd: boolean
}

type TTranscribeAudiosResAPI = {
    audioId: string
    audioFilename: string
    transcription: string | null
}
