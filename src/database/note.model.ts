import { ENoteLengths } from '@/note/enums'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type TNoteDocument = InstanceType<typeof Note>

@Schema()
export class Note {
    @Prop({
        required: true,
        minlength: ENoteLengths.MIN_LENGTH_NOTE_UNIQUE_NAME,
        maxlength: ENoteLengths.MAX_LENGTH_NOTE_UNIQUE_NAME,
        unique: true,
    })
    noteUniqueName: string

    @Prop({ maxlength: ENoteLengths.MAX_LENGTH_NOTE_TITLE })
    title?: string

    @Prop({ maxlength: ENoteLengths.MAX_LENGTH_NOTE_AUTHOR })
    author?: string

    @Prop({ minlength: ENoteLengths.MIN_LENGTH_NOTE_CONTENT })
    content?: string

    @Prop({
        minlength: ENoteLengths.MIN_LENGTH_PASSWORD,
        maxlength: ENoteLengths.MAX_LENGTH_PASSWORD,
    })
    password?: string

    @Prop({ default: Date.now })
    createdAt: Date
}

export const NoteSchema = SchemaFactory.createForClass(Note)
