import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationController } from './notification-api.controller'
import { NotificationGateway } from './gateway/notification.gateway'
import { AuthModule } from '@/auth/auth.module'

@Module({
    imports: [AuthModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway],
    exports: [NotificationService],
})
export class NotificationModule {}
