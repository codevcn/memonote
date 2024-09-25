type TGetNotificationsResAPI = {
    notifs: TNotifData[]
    isEnd: boolean
}

type TTranscribeAudiosResAPI = {
    transcription: string | null
    confidence: number
}
