import { Module } from '@nestjs/common'
import { NotificationService } from './notification.service.js'
import { NotificationAPIController } from './notification-api.controller.js'
import { NotificationGateway } from './notification.gateway.js'
import { AuthModule } from '../auth/auth.module.js'

@Module({
    imports: [AuthModule],
    controllers: [NotificationAPIController],
    providers: [NotificationService, NotificationGateway],
    exports: [NotificationService],
})
export class NotificationModule {}
