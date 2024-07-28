import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model, Types } from 'mongoose'
import { Note } from '@/note/note.model'

export type TArticleDocument = HydratedDocument<Article>
export type TArticleModel = Model<Article>

@Schema({ _id: false })
export class Content {
    @Prop({ default: Date.now, required: true })
    updatedAt: Date
}

@Schema()
export class Article {
    @Prop({
        type: Types.ObjectId,
        ref: Note.name,
        required: true,
        unique: true,
    })
    note: Note | Types.ObjectId

    @Prop({ required: true })
    localPath: string

    @Prop({ type: Content, required: true })
    content: Content

    @Prop({ default: Date.now, required: true })
    createdAt: Date
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
