import { Module } from '@nestjs/common'
import { HealthcheckService } from './healthcheck.service'
import { HealthcheckController } from './healthcheck.controller'

@Module({
    providers: [HealthcheckService],
    controllers: [HealthcheckController],
})
export class HealthcheckModule {}
