import { HydratedDocument, Types } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Note } from '@/note/note.model'
import { ENotificationTypes } from '@/notification/enums'

export type TNotificationDocument = HydratedDocument<Notification>

@Schema()
export class Notif {
    @Prop({ required: true })
    title: string

    @Prop({
        required: true,
        enum: Object.values(ENotificationTypes),
    })
    type: ENotificationTypes

    @Prop({ required: true })
    message: string

    @Prop({ required: true, default: false })
    read: boolean

    @Prop({ required: true, default: Date.now })
    createdAt?: Date
}

@Schema()
export class Notification {
    @Prop({ type: Types.ObjectId, ref: Note.name, required: true })
    note: Note | Types.ObjectId

    @Prop({ type: [Notif], required: true })
    notifications: Notif[]

    @Prop({ default: Date.now, required: true })
    createdAt?: Date
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
