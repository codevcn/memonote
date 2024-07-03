import { ENoteLengths } from '@/note/enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument } from 'mongoose'

export type TNoteDocument = HydratedDocument<typeof Note>

@Schema()
class Status {
    @Prop({ required: true })
    active: boolean

    @Prop({ required: true })
    message: string
}

@Schema()
export class Note {
    @Prop({
        required: true,
        minlength: ENoteLengths.MIN_LENGTH_NOTE_UNIQUE_NAME,
        maxlength: ENoteLengths.MAX_LENGTH_NOTE_UNIQUE_NAME,
        unique: true,
    })
    uniqueName: string

    @Prop({ maxlength: ENoteLengths.MAX_LENGTH_NOTE_TITLE })
    title: string

    @Prop({ maxlength: ENoteLengths.MAX_LENGTH_NOTE_AUTHOR })
    author: string

    @Prop({ maxlength: ENoteLengths.MAX_LENGTH_NOTE_CONTENT })
    content: string

    @Prop({
        minlength: ENoteLengths.MIN_LENGTH_PASSWORD,
        maxlength: ENoteLengths.MAX_LENGTH_PASSWORD,
    })
    password: string

    @Prop({ type: Status })
    status: Status

    @Prop({ default: Date.now, required: true })
    updatedAt: Date

    @Prop({ default: Date.now, required: true })
    createdAt: Date
}

export const NoteSchema = SchemaFactory.createForClass(Note)
