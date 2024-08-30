import { Module } from '@nestjs/common'
import { NoteService } from './note.service'
import { NoteAPIController } from './note-api.controller'
import { JWTService } from '@/auth/jwt.service'
import { AuthService } from '@/auth/auth.service'
import { NoteGateway } from './note.gateway'
import { NotificationService } from '@/notification/notification.service'

@Module({
    controllers: [NoteAPIController],
    providers: [NoteService, JWTService, AuthService, NoteGateway, NotificationService],
    exports: [NoteService],
})
export class NoteModule {}
