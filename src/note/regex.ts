import { ENoteLengths } from './enums'

export const noteUniqueNameRegEx = new RegExp(
    `^[0-9A-Za-z-_]{${ENoteLengths.MIN_LENGTH_NOTE_UNIQUE_NAME},${ENoteLengths.MAX_LENGTH_NOTE_UNIQUE_NAME}}$`,
)

export const notePasswordRegEx = new RegExp(
    `^.{${ENoteLengths.MIN_LENGTH_PASSWORD},${ENoteLengths.MAX_LENGTH_PASSWORD}}$`,
)
