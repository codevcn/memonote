import { Module } from '@nestjs/common'
import { NoteService } from './note.service'
import { NoteAPIController } from './note-api.controller'
import { JWTService } from '@/auth/jwt.service'
import { AuthService } from '@/auth/auth.service'
import { NormalEditorGateway } from './note.gateway'
import { NotificationService } from '@/notification/notification.service'
import { TranscriptAudioService } from '@/tools/transcript-audio.service'

@Module({
    controllers: [NoteAPIController],
    providers: [
        NoteService,
        JWTService,
        AuthService,
        NormalEditorGateway,
        NotificationService,
        TranscriptAudioService,
    ],
    exports: [NoteService],
})
export class NoteModule {}
