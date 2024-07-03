import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Note } from './note.model'

export type TNotificationDocument = HydratedDocument<typeof Notification>

@Schema()
class Noti {
    @Prop({ required: true })
    title: string

    @Prop({ required: true })
    message: string

    @Prop({ required: true, default: Date.now })
    createdAt: Date
}

@Schema()
export class Notification {
    @Prop({ type: String, ref: 'Note.uniqueName', required: true })
    note: Note

    @Prop({ type: [Noti], required: true })
    notifications: Noti[]

    @Prop({ default: Date.now, required: true })
    createdAt: Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
