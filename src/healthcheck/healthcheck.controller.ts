import { APIRoutes } from '../utils/routes.js'
import { Controller, Get, Query } from '@nestjs/common'
import { IHealthcheckController } from './interfaces.js'
import { HealthcheckService } from './healthcheck.service.js'
import { CheckAliveQueryDTO } from './DTOs.js'

@Controller(APIRoutes.healthcheck)
export class HealthcheckController implements IHealthcheckController {
    constructor(private healthcheckService: HealthcheckService) {}

    @Get()
    async checkServerAlive(@Query() query: CheckAliveQueryDTO) {
        return await this.healthcheckService.checkServerAlive(query.holder)
    }
}
