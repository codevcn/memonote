import bytes from 'bytes'

export enum ETransribeFiles {
    SIZE_PER_CHUNK = bytes('3MB'),
}

export enum EAudioFiles {
    MAX_FILE_SIZE = bytes('10MB'),
    MAX_FILENAME_SIZE = bytes('100B'),
}

export enum EAudioFields {
    TRANSCRIBE_AUDIO = 'audioFile',
}

export enum EAudioLangs {
    ENGLISH = 'en',
    ENGLISH_US = 'en-us',
    VIETNAMESE = 'vi',
}
