import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification-api.controller'
import { NotificationGateway } from './gateway/notification.gateway'
import { AuthService } from '@/auth/auth.service'
import { JWTService } from '@/auth/jwt.service'
import { NoteService } from '@/note/note.service'

@Module({
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway, AuthService, JWTService, NoteService],
    exports: [NotificationService],
})
export class NotificationModule {}
