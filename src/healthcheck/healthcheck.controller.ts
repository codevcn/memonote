import { APIRoutes } from '../utils/routes.js'
import { Controller, Get } from '@nestjs/common'
import { IHealthcheckController } from './interfaces.js'
import { HealthcheckService } from './healthcheck.service.js'

@Controller(APIRoutes.healthcheck)
export class HealthcheckController implements IHealthcheckController {
    constructor(private healthcheckService: HealthcheckService) {}

    @Get()
    async checkServerAlive() {
        return await this.healthcheckService.checkServerAlive()
    }
}
