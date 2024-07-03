import type { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note } from '@/database/note.model'
import { Helpers } from '@/utils/helpers'
import { ENoteLengths } from './enums'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { JWTService } from '@/auth/jwt.service'
import { EAuthEncryption } from '@/utils/enums'
import type { TNoteForm } from './types'
import { AddPasswordForNotePayloadDTO } from './DTOs'
import { UserSessions } from './gateway/sessions'

@Injectable()
export class NoteService {
    constructor(
        @InjectModel(Note.name) private noteModel: Model<Note>,
        private jwtService: JWTService,
    ) {}

    async findNote(noteUniqueName: string) {
        return await this.noteModel.findOne({ uniqueName: noteUniqueName }).lean()
    }

    async createNewNote(noteUniqueName: string) {
        return await this.noteModel.create({ uniqueName: noteUniqueName })
    }

    async updateNoteForm(noteUniqueName: string, noteForm: TNoteForm): Promise<void> {
        const { title, author, content } = noteForm
        const dataForUpdate: TNoteForm = {}
        if (title || title === '') {
            dataForUpdate.title = title
        }
        if (author || author === '') {
            dataForUpdate.author = author
        }
        if (content || content === '') {
            dataForUpdate.content = content
        }
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            {
                $set: dataForUpdate,
            },
        )
    }

    generateNoteUniqueName(): string {
        return Helpers.generateRandomString(ENoteLengths.LENGTH_OF_RAMDOM_UNIQUE_NAME)
    }

    async hashPassword(rawPassword: string): Promise<string> {
        return await bcrypt.hash(rawPassword, EAuthEncryption.HASH_PASSWORD_NUMBER_OF_ROUNDS)
    }

    async setPasswordForNote(
        payload: AddPasswordForNotePayloadDTO,
        noteUniqueName: string,
        res: Response,
    ): Promise<void> {
        const { password } = payload
        const hashedPassword = await this.hashPassword(password)
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            { $set: { password: hashedPassword } },
        )
        const jwt = await this.jwtService.createJWT({ noteUniqueName })
        this.jwtService.sendJWTToClient(res, { token: jwt })
        UserSessions.addUserSession(noteUniqueName, jwt)
        const { logoutAll } = payload
        if (logoutAll) {
            UserSessions.logoutUserSessions(noteUniqueName, jwt)
        }
    }

    async removePasswordForNote(noteUniqueName: string): Promise<void> {
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            {
                $set: {
                    password: null,
                },
            },
        )
    }
}
