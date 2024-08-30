import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service'
import { NotificationAPIController } from './notification-api.controller'
import { NotificationGateway } from './notification.gateway'
import { AuthModule } from '@/auth/auth.module'

@Module({
    imports: [AuthModule],
    controllers: [NotificationAPIController],
    providers: [NotificationService, NotificationGateway],
    exports: [NotificationService],
})
export class NotificationModule {}
