import { APIRoutes } from '@/utils/routes'
import { Controller, Get } from '@nestjs/common'
import { IHealthcheckController } from './interfaces'
import { HealthcheckService } from './healthcheck.service'

@Controller(APIRoutes.healthcheck)
export class HealthcheckController implements IHealthcheckController {
    constructor(private healthcheckService: HealthcheckService) {}

    @Get()
    async checkServerAlive() {
        return await this.healthcheckService.checkServerAlive()
    }
}
