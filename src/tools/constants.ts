import bytes from 'bytes'

export enum EAudioFiles {
    MAX_FILE_SIZE = bytes('10MB'),
    MAX_FILENAME_SIZE = bytes('100B'),
    MAX_FILES_COUNT = 3,
}

export enum EAudioFields {
    TRANSCRIBE_AUDIO = 'audioFile',
    TRANSCRIBE_AUDIOS = 'audioFiles',
}

export enum EAudioLangs {
    ENGLISH = 'en',
    ENGLISH_US = 'en-us',
    VIETNAMESE = 'vi',
    MULTI = 'multi',
}
