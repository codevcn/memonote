import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note } from '@/database/note.model'
import type { TNoteDocument } from '@/database/note.model'
import { generateRandomString } from '@/utils/helpers'
import { ENoteLengths } from './enums'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { JWTService } from '@/auth/jwt.service'

@Injectable()
export class NoteService {
    private hashPasswordNumberOfRounds: number = 10

    constructor(
        @InjectModel(Note.name) private noteModel: Model<Note>,
        private jwtService: JWTService,
    ) {}

    async findNote(noteUniqueName: string): Promise<TNoteDocument | null> {
        return await this.noteModel.findOne({ noteUniqueName }).lean()
    }

    async createNewNote(noteUniqueName: string): Promise<TNoteDocument | null> {
        return await this.noteModel.create({ noteUniqueName })
    }

    generateNoteUniqueName(): string {
        return generateRandomString(ENoteLengths.LENGTH_OF_RAMDOM_UNIQUE_NAME)
    }

    async hashPassword(rawPassword: string): Promise<string> {
        return await bcrypt.hash(rawPassword, this.hashPasswordNumberOfRounds)
    }

    async setPasswordForNote(
        rawPassword: string,
        noteUniqueName: string,
        res: Response,
    ): Promise<void> {
        const hashedPassword = await this.hashPassword(rawPassword)
        await this.noteModel.updateOne({ noteUniqueName }, { $set: { password: hashedPassword } })
        const jwt = await this.jwtService.createJWT({ noteUniqueName })
        this.jwtService.sendJWTToClient(res, { token: jwt })
    }

    async removePasswordForNote(noteUniqueName: string): Promise<void> {
        await this.noteModel.updateOne(
            { noteUniqueName },
            {
                $set: {
                    password: null,
                },
            },
        )
    }
}
