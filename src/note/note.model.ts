import { EEditors, ENoteLengths } from '@/note/enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import type { HydratedDocument, Model } from 'mongoose'

export type TNoteDocument = HydratedDocument<Note>
export type TNoteModel = Model<Note>

@Schema({ _id: false })
export class Status {
    @Prop({ required: true })
    active: boolean

    @Prop()
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

    @Prop({
        required: true,
        default: false,
        enum: Object.values(EEditors),
    })
    editor: EEditors

    @Prop({ type: Status, required: true })
    status: Status

    @Prop({ default: Date.now, required: true })
    createdAt: Date
}

export const NoteSchema = SchemaFactory.createForClass(Note)
