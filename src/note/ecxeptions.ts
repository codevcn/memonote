import { WsException } from '@nestjs/websockets'

export class CustomWsException extends WsException {
    noteUniqueName: string

    constructor(message: string, noteUniqueName: string) {
        super(message)
        this.noteUniqueName = noteUniqueName
    }
}
