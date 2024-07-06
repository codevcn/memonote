import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note, TNoteDocument, TNoteModel } from './note.model'
import { ENoteLengths } from './enums'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { JWTService } from '@/auth/jwt.service'
import { EAuthEncryption } from './enums'
import type { TNoteForm } from './types'
import { AddPasswordForNotePayloadDTO } from './DTOs'
import { UserSessions } from './gateway/sessions'
import { ENotificationTypes } from '@/notification/enums'
import path from 'path'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ENoteMessages } from './messages'
import { NotificationService } from '@/notification/notification.service'

@Injectable()
export class NoteService {
    constructor(
        @InjectModel(Note.name) private noteModel: TNoteModel,
        private jwtService: JWTService,
        private notificationService: NotificationService,
    ) {}

    async findNote(noteUniqueName: string): Promise<TNoteDocument | null> {
        return await this.noteModel.findOne({ uniqueName: noteUniqueName }).lean()
    }

    async createNewNote(noteUniqueName: string): Promise<TNoteDocument> {
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

    generateNoteUniqueName(
        uniqueNameLength: ENoteLengths = ENoteLengths.LENGTH_OF_RAMDOM_UNIQUE_NAME,
    ): string {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        const charsetLength = charset.length
        for (let i = 0; i < uniqueNameLength; i++) {
            const randomIndex = Math.floor(Math.random() * charsetLength)
            result += charset[randomIndex]
        }
        return result
    }

    extractNoteUniqueNameFromURL(url: string): string {
        return path.basename(new URL(url).pathname)
    }

    async hashPassword(rawPassword: string): Promise<string> {
        return await bcrypt.hash(rawPassword, EAuthEncryption.HASH_PASSWORD_NUMBER_OF_ROUNDS)
    }

    async setPasswordForNote(
        payload: AddPasswordForNotePayloadDTO,
        noteUniqueName: string,
    ): Promise<void> {
        const { password } = payload
        const hashedPassword = await this.hashPassword(password)
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            { $set: { password: hashedPassword } },
        )
    }

    async setPasswordForNoteHandler(
        payload: AddPasswordForNotePayloadDTO,
        noteUniqueName: string,
        res: Response,
    ): Promise<void> {
        const note = await this.noteModel.findOne({ uniqueName: noteUniqueName })
        if (!note) {
            throw new BaseCustomException(ENoteMessages.NOTE_NOT_FOUND)
        }
        await this.setPasswordForNote(payload, noteUniqueName)
        const jwt = await this.jwtService.createJWT({ noteUniqueName })
        this.jwtService.sendJWTToClient(res, { token: jwt })

        UserSessions.addUserSession(noteUniqueName, jwt)
        const { logoutAll } = payload
        if (logoutAll) {
            UserSessions.logoutUserSessions(noteUniqueName, jwt)
        }

        await this.notificationService.createNotifHandler(note, {
            title: 'Password set',
            message: 'Password has been changed by user',
            read: false,
            type: ENotificationTypes.SET_PASSWORD,
            createdAt: new Date(),
        })
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
