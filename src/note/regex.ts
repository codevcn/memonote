import { ENoteLengths } from './constants.js'

export const NOTE_UNIQUE_NAME_REGEX = new RegExp(
    `^[0-9A-Za-z-_]{${ENoteLengths.MIN_LENGTH_NOTE_UNIQUE_NAME},${ENoteLengths.MAX_LENGTH_NOTE_UNIQUE_NAME}}$`,
)

export const NOTE_PASSWORD_REGEX = new RegExp(
    `^.{${ENoteLengths.MIN_LENGTH_PASSWORD},${ENoteLengths.MAX_LENGTH_PASSWORD}}$`,
)
