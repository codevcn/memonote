import { Module } from '@nestjs/common'
import { HealthcheckService } from './healthcheck.service.js'
import { HealthcheckController } from './healthcheck.controller.js'

@Module({
    providers: [HealthcheckService],
    controllers: [HealthcheckController],
})
export class HealthcheckModule {}
