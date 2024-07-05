import { Note, NoteSchema } from '@/note/note.model'
import { Notification, NotificationSchema } from '@/notification/notification.model'
import { DynamicModule, Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

export const connectToDB = () => {
    return MongooseModule.forRoot(process.env.DATABASE_URL, {
        onConnectionCreate(connection) {
            connection.on('error', (error) => {
                console.log('>>> Fail to connect to DB! Error:\n', error)
            })
            connection.on('connected', () => {
                console.log('>>> Connected to DB successfully!')
            })
            connection.on('disconnecting', () => {
                console.log('>>> Disconnecting to DB!')
            })
            connection.on('disconnected', () => {
                console.log('>>> Disconnected to DB!')
            })
            connection.on('close', () => {
                console.log('>>> Closed connection to DB!')
            })
        },
    })
}

export const registerModels: DynamicModule[] = [
    MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }]),
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
]

@Global()
@Module({
    imports: registerModels,
    exports: registerModels,
})
export class DBModelsModule {}
