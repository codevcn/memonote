import { type HydratedDocument, type Model, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Note } from '@/note/note.model'
import { ENotificationTypes } from '@/notification/enums'

export type TNotificationDocument = HydratedDocument<Notification>
export type TNotificationModel = Model<Notification>

@Schema()
export class Notification {
    @Prop({ type: Types.ObjectId, ref: Note.name, required: true })
    note: Note | Types.ObjectId

    @Prop({ required: true })
    message: string

    @Prop({
        required: true,
        enum: Object.values(ENotificationTypes),
    })
    type: ENotificationTypes

    @Prop({ required: true, default: false })
    read: boolean

    @Prop({ default: Date.now, required: true })
    createdAt?: Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
