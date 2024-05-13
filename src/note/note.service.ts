import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Note } from './note.schema'
import { generateRandomString } from '@/utils/helpers'
import { ENoteLengths } from './enums'

@Injectable()
export class NoteService {
    constructor(@InjectModel(Note.name) private noteModel: Model<Note>) {}

    async findNote(noteUniqueName: string) {
        return await this.noteModel.findOne({ noteUniqueName }).lean()
    }

    async createNewNote(noteUniqueName: string) {
        return await this.noteModel.create({ noteUniqueName })
    }

    generateNoteUniqueName(): string {
        return generateRandomString(ENoteLengths.LENGTH_OF_RAMDOM_UNIQUE_NAME)
    }
}
