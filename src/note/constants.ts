import bytes from 'bytes'

export enum ENoteLengths {
    MAX_LENGTH_NOTE_UNIQUE_NAME = 50,
    MIN_LENGTH_NOTE_UNIQUE_NAME = 1,
    LENGTH_OF_RAMDOM_UNIQUE_NAME = 6,
    MAX_LENGTH_NOTE_CONTENT = 50000,
    MAX_LENGTH_PASSWORD = 50,
    MIN_LENGTH_PASSWORD = 4,
    MAX_LENGTH_NOTE_TITLE = 300,
    MAX_LENGTH_NOTE_AUTHOR = 100,
}

export enum EAuthEncryption {
    HASH_PASSWORD_NUMBER_OF_ROUNDS = 10,
}

export enum EEditors {
    NORMAL = 'normal',
    RICH = 'rich',
}

export enum ENoteEvents {
    NOTE_FORM_EDITED = 'note_form_edited',
    FETCH_NOTE_FORM = 'fetch_note_form',
    TRANSCRIBE_AUDIO = 'transcript_auido',
}

export enum EAudioChunk {
    SIZE_PER_CHUNK = bytes('3MB'),
}
