export enum EAuthMessages {
    TOKEN_NOT_FOUND = 'Token not found',
    FAIL_TO_VERIFY_PASSWORD = 'Fail to verify password',
    FAIL_TO_AUTH = 'Fail to auth',
    NOTE_NOT_FOUND = "Can't find the note",
}

export enum EValidationMessages {
    WRONG_DATE_ISO_TYPE = 'Birthday value must be in ISO 8601 type',
    SOMETHING_WENT_WRONG = 'Something went wrong in server...',
    NO_TRACE = 'No trace',
    INVALID_INPUT = 'Invalid input',
    INVALID_PASSWORD = 'Invalid password',
    INVALID_NOTE_UNIQUE_NAME = 'Invalid unique note name',
}
