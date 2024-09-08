import { Module } from '@nestjs/common'
import { NoteService } from './note.service.js'
import { NoteAPIController } from './note-api.controller.js'
import { JWTService } from '../auth/jwt.service.js'
import { AuthService } from '../auth/auth.service.js'
import { NormalEditorGateway } from './note.gateway.js'
import { NotificationService } from '../notification/notification.service.js'
import { TranscriptAudioService } from '../tools/transcript-audio.service.js'

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
