import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note, TNoteDocument, TNoteModel } from './note.model'
import { EEditors, ENoteLengths } from './enums'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { JWTService } from '@/auth/jwt.service'
import { EAuthEncryption } from './enums'
import type { TNoteForm } from './types'
import { SetPasswordForNotePayloadDTO } from './DTOs'
import { UserSessions } from './gateway/sessions'
import { ENotificationTypes } from '@/notification/enums'
import path from 'path'
import { BaseCustomException } from '@/utils/exception/custom.exception'
import { ENoteMessages } from './messages'
import { NotificationService } from '@/notification/notification.service'
import { I18nService } from 'nestjs-i18n'
import type { IDataI18nTranslations } from '@/lang/i18n.generated'
import { ELangCodes } from '@/lang/enums'

@Injectable()
export class NoteService {
    constructor(
        @InjectModel(Note.name) private noteModel: TNoteModel,
        private jwtService: JWTService,
        private notificationService: NotificationService,
        private i18n: I18nService<IDataI18nTranslations>,
    ) {}

    async findNote(noteUniqueName: string): Promise<TNoteDocument | null> {
        return await this.noteModel.findOne({ uniqueName: noteUniqueName }).lean()
    }

    async createNewNote(noteUniqueName: string): Promise<TNoteDocument> {
        return await this.noteModel.create({ uniqueName: noteUniqueName, status: { active: true } })
    }

    async createNewNoteHandler(noteUniqueName: string): Promise<TNoteDocument> {
        const note = await this.createNewNote(noteUniqueName)
        await this.notificationService.createNewNotif(note._id.toString(), {
            createdAt: new Date(),
            message: this.i18n.t('notification.message.Create_new_note', { lang: ELangCodes.EN }),
            type: ENotificationTypes.CREATE_NEW_NOTE,
        })
        return note
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

    async verifyPassword(hashedPassword: string, rawPassword: string): Promise<boolean> {
        return await bcrypt.compare(rawPassword, hashedPassword)
    }

    async setPasswordForNote(
        payload: SetPasswordForNotePayloadDTO,
        noteUniqueName: string,
    ): Promise<void> {
        const { password } = payload
        const note = await this.findNote(noteUniqueName)
        if (!note) throw new BaseCustomException(ENoteMessages.NOTE_NOT_FOUND)
        if (note.password) {
            const isOverlap = await this.verifyPassword(note.password, password)
            if (isOverlap) {
                throw new BaseCustomException(ENoteMessages.OVERLAP_PASSWORD)
            }
        }
        const hashedPassword = await this.hashPassword(password)
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            { $set: { password: hashedPassword } },
        )
    }

    async setPasswordForNoteHandler(
        payload: SetPasswordForNotePayloadDTO,
        noteUniqueName: string,
        res: Response,
        lang: ELangCodes,
    ): Promise<void> {
        const note = await this.noteModel.findOne({ uniqueName: noteUniqueName })
        if (!note) {
            throw new BaseCustomException(ENoteMessages.NOTE_NOT_FOUND)
        }
        await this.setPasswordForNote(payload, noteUniqueName)
        const setPasswordDate = new Date()
        const jwt = await this.jwtService.createJWT({ noteUniqueName })
        this.jwtService.sendJWTToClient(res, { token: jwt })

        UserSessions.addUserSession(noteUniqueName, jwt)
        const { logoutAll } = payload
        if (logoutAll) {
            UserSessions.logoutUserSessions(noteUniqueName, jwt)
        }

        await this.notificationService.createNewNotifHandler(
            note.id,
            note.uniqueName,
            {
                message: this.i18n.t('notification.message.Set_password', { lang: ELangCodes.EN }),
                type: ENotificationTypes.SET_PASSWORD,
                createdAt: setPasswordDate,
            },
            lang,
        )
    }

    async removePasswordForNote(noteUniqueName: string, lang: ELangCodes): Promise<void> {
        const note = await this.noteModel.findOne({ uniqueName: noteUniqueName })
        if (!note) {
            throw new BaseCustomException(ENoteMessages.NOTE_NOT_FOUND)
        }
        await this.noteModel.findOneAndUpdate(
            { uniqueName: noteUniqueName },
            {
                $set: {
                    password: null,
                },
            },
        )
        const removePasswordDate = new Date()
        await this.notificationService.createNewNotifHandler(
            note.id,
            note.uniqueName,
            {
                message: this.i18n.t('notification.message.Remove_password', {
                    lang: ELangCodes.EN,
                }),
                type: ENotificationTypes.REMOVE_PASSWORD,
                createdAt: removePasswordDate,
            },
            lang,
        )
    }

    async switchEditor(noteUniqueName: string, editor: EEditors): Promise<void> {
        await this.noteModel.updateOne(
            { uniqueName: noteUniqueName },
            {
                $set: {
                    editor,
                },
            },
        )
    }
}
