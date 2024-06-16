import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Note, NoteSchema } from '@/database/note.model'
import { NoteService } from './note.service'
import { NoteAPIController } from './note-api.controller'
import { JWTService } from '@/auth/jwt.service'
import { AuthService } from '@/auth/auth.service'
import { NoteGateway } from './gateway/note.gateway'

@Module({
    imports: [MongooseModule.forFeature([{ name: Note.name, schema: NoteSchema }])],
    controllers: [NoteAPIController],
    providers: [NoteService, JWTService, AuthService, NoteGateway],
    exports: [NoteService],
})
export class NoteModule {}
